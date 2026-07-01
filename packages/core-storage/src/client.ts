import ImageKit from "imagekit";
import { getEnv } from "@atithira/config";

let client: ImageKit | undefined;

export function getImageKitClient(): ImageKit {
  if (!client) {
    const env = getEnv();
    client = new ImageKit({
      publicKey: env.IMAGEKIT_PUBLIC_KEY,
      privateKey: env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
    });
  }
  return client;
}
