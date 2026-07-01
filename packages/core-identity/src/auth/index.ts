export { handlers, auth, signIn, signOut } from "./auth-config";

// installAuthResolver() is exported separately from
// "@atithira/core-identity/auth-resolver", not re-exported here — importing
// it from this barrel would eagerly load auth-config.ts (and therefore
// @node-rs/argon2's native binding) as a side effect, which breaks in
// contexts like instrumentation.ts that can't bundle native modules.
