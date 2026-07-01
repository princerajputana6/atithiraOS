import { hash, verify } from "@node-rs/argon2";

// @node-rs/argon2 (napi-rs, prebuilt binaries) instead of the plain `argon2`
// package, which has a known history of native-build failures on Vercel
// ("Invalid ELF Header" / no prebuilt binary for the deploy target).

export async function hashPassword(password: string): Promise<string> {
  return hash(password);
}

export async function verifyPassword(
  passwordHash: string,
  password: string,
): Promise<boolean> {
  return verify(passwordHash, password);
}
