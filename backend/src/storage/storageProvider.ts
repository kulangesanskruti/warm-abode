import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

/**
 * Public URL prefix for locally stored files. Served by app.ts via express.static
 * under the /api/v1 prefix so the dev proxy forwards it to the backend.
 */
export const LOCAL_PUBLIC_PREFIX = "/api/v1/uploads";

export type StoredFile = { provider: string; providerKey: string; url: string };
export type UploadInput = { buffer: Buffer; fileName: string; mimeType: string; folder: string };

export interface StorageProvider {
  upload(input: UploadInput): Promise<StoredFile>;
  delete(providerKey: string): Promise<void>;
}

export class LocalStorageProvider implements StorageProvider {
  private root = path.resolve(process.env.FILE_STORAGE_PATH || "./storage/files");
  async upload(input: UploadInput): Promise<StoredFile> {
    const key = `${input.folder}/${crypto.randomUUID()}-${input.fileName}`;
    const target = path.join(this.root, key);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, input.buffer, { flag: "wx" });
    return { provider: "local", providerKey: key, url: `${LOCAL_PUBLIC_PREFIX}/${key}` };
  }
  async delete(providerKey: string) {
    await fs.rm(path.join(this.root, providerKey), { force: true });
  }
}

export class CloudinaryStorageProvider implements StorageProvider {
  async upload(): Promise<StoredFile> {
    throw new Error("Cloudinary provider requires the Cloudinary SDK/configuration");
  }
  async delete(): Promise<void> {
    throw new Error("Cloudinary provider requires the Cloudinary SDK/configuration");
  }
}

export function getStorageProvider(): StorageProvider {
  return process.env.FILE_STORAGE_PROVIDER === "cloudinary"
    ? new CloudinaryStorageProvider()
    : new LocalStorageProvider();
}
