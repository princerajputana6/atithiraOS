import { getImageKitClient } from "./client";

export interface UploadAuthParams {
  token: string;
  expire: number;
  signature: string;
}

/**
 * The browser uploads the file bytes directly to ImageKit using these
 * signed params — nothing is proxied through a Vercel function, which
 * matters for both the free-tier invocation budget and upload latency.
 */
export function getUploadAuthParams(): UploadAuthParams {
  return getImageKitClient().getAuthenticationParameters();
}

export async function deleteFile(fileId: string): Promise<void> {
  await getImageKitClient().deleteFile(fileId);
}
