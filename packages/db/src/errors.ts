export class TenantContextMissingError extends Error {
  constructor() {
    super(
      "No tenant context is set for this operation. Wrap the call in runWithTenantContext() before touching any TenantScopedRepository.",
    );
    this.name = "TenantContextMissingError";
  }
}
