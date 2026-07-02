import { randomUUID } from "node:crypto";
import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { getMongoClientPromise } from "@atithira/db";
import { getEnv } from "@atithira/config";
import { getUserRepository, getSessionDenylistRepository } from "../collections";
import { verifyPassword } from "../crypto/password";
import { verifyTotpToken } from "../mfa/totp";
import { decryptSecret } from "../mfa/encryption";
import { consumeSsoTicket } from "../services/sso-service";

// Custom JWT fields are applied via inline casts in the callbacks below
// rather than a `declare module "next-auth/jwt"` augmentation — that
// augmentation fails to resolve under this project's moduleResolution
// setting even though the subpath exists and resolves fine standalone.
interface AppJwt {
  userId?: string;
  sessionVersion?: number;
  jti?: string;
}

declare module "next-auth" {
  interface Session {
    jti?: string;
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

/**
 * Auth.js v5's Credentials provider forces the JWT session strategy —
 * database sessions silently don't populate with Credentials. Revocation
 * (which the doc requires: "session management, device/session revocation")
 * is reconstructed on top of JWT via two independent mechanisms:
 *   1. users.sessionVersion, embedded in the token and re-checked on every
 *      refresh — bumping it logs the user out everywhere (password change,
 *      admin action, compromise response).
 *   2. a per-token `jti` checked against session_denylist (TTL-indexed) —
 *      revokes one specific device/session without touching the others.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(getMongoClientPromise()),
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/login" },
  secret: getEnv().AUTH_SECRET,
  // Behind a TLS-terminating proxy (Vercel, most PaaS) the app sees the
  // request as http internally with the real scheme in X-Forwarded-Proto.
  // Trusting the forwarded host lets Auth.js detect https correctly, so the
  // production session cookie is set with the Secure flag its `__Secure-`
  // name prefix requires — without this the browser silently drops the
  // cookie and every protected route bounces back to /login.
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totp: { label: "Authenticator code", type: "text" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        const totp = credentials?.totp as string | undefined;
        if (!email || !password) return null;

        const userRepo = await getUserRepository();
        const user = await userRepo.findByEmail(email);
        if (!user || !user.emailVerified || user.status !== "active") return null;
        // SSO-only users have no passwordHash — the password flow can never
        // authenticate them, by design (they must use their tenant's IdP).
        if (!user.passwordHash) return null;
        if (!(await verifyPassword(user.passwordHash, password))) return null;

        if (user.mfaEnabled) {
          if (!totp || !user.mfaSecret) return null;
          if (!verifyTotpToken(decryptSecret(user.mfaSecret), totp)) return null;
        }

        return {
          id: user._id,
          email: user.email,
          name: user.name ?? undefined,
          sessionVersion: user.sessionVersion,
        };
      },
    }),
    // The bridge between a verified IdP identity and an Auth.js session (see
    // sso-service.ts's issueSsoTicket/consumeSsoTicket). Never called
    // directly by a user — the SSO callback routes are the only issuer of
    // valid tickets, and each ticket works exactly once.
    Credentials({
      id: "sso-ticket",
      name: "SSO",
      credentials: {
        ticket: { label: "Ticket", type: "text" },
      },
      authorize: async (credentials) => {
        const ticket = credentials?.ticket as string | undefined;
        if (!ticket) return null;

        const consumed = await consumeSsoTicket(ticket);
        if (!consumed) return null;

        const userRepo = await getUserRepository();
        const user = await userRepo.findById(consumed.userId);
        if (!user || user.status !== "active") return null;

        return {
          id: user._id,
          email: user.email,
          name: user.name ?? undefined,
          sessionVersion: user.sessionVersion,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      const appToken = token as typeof token & AppJwt;

      if (user) {
        appToken.userId = user.id;
        appToken.sessionVersion =
          (user as { sessionVersion?: number }).sessionVersion ?? 0;
        appToken.jti = randomUUID();
      }

      if (!appToken.userId) return appToken;

      // Re-validated on every use, not just at sign-in: catches both
      // "log out everywhere" (sessionVersion bump) and single-device revoke
      // (jti denylisted) without waiting for the JWT to naturally expire.
      const userRepo = await getUserRepository();
      const currentUser = await userRepo.findById(appToken.userId);
      if (!currentUser || currentUser.sessionVersion !== appToken.sessionVersion) {
        return null;
      }

      if (appToken.jti) {
        const denylistRepo = await getSessionDenylistRepository();
        if (await denylistRepo.isDenylisted(appToken.jti)) {
          return null;
        }
      }

      return appToken;
    },
    session: async ({ session, token }) => {
      const appToken = token as typeof token & AppJwt;
      if (session.user && appToken.userId) {
        session.user.id = appToken.userId;
      }
      session.jti = appToken.jti;
      return session;
    },
  },
});
