import crypto from "node:crypto";
import { ApiError, HttpStatusCode } from "../utils/errors";
import { fileRepository } from "../repositories/fileRepository";
import { getStorageProvider } from "../storage/storageProvider";
import { validateFile, type FileCategory, type FileEntityType } from "../validators/file";

const storage = getStorageProvider();

export const fileService = {
  async upload(
    ownerId: string,
    file: Express.Multer.File,
    meta: {
      category: FileCategory;
      entityType: FileEntityType;
      entityId?: string;
      propertyId?: string;
      tenantId?: string;
      expiresAt?: Date;
      isCover?: boolean;
    },
  ) {
    let info: ReturnType<typeof validateFile>;
    try {
      info = validateFile(file);
    } catch (error) {
      throw new ApiError(
        error instanceof Error ? error.message : "Invalid file",
        HttpStatusCode.BAD_REQUEST,
      );
    }
    const checksum = crypto.createHash("sha256").update(file.buffer).digest("hex");
    const duplicate = await fileRepository.findDuplicate(ownerId, checksum);
    if (duplicate) return duplicate;
    const stored = await storage.upload({
      buffer: file.buffer,
      fileName: info.safeName,
      mimeType: file.mimetype,
      folder: `${ownerId}/${meta.category.toLowerCase()}`,
    });
    const asset = await fileRepository.create({
      ownerId,
      originalName: file.originalname,
      safeName: info.safeName,
      provider: stored.provider,
      providerKey: stored.providerKey,
      url: stored.url,
      size: file.size,
      mimeType: file.mimetype,
      extension: info.extension,
      checksum,
      ...meta,
    });
    if (meta.isCover && meta.propertyId)
      await fileRepository.markCover(ownerId, meta.propertyId, asset.id);
    return asset;
  },
  async get(ownerId: string, id: string, request: { ip?: string; userAgent?: string }) {
    const asset = await fileRepository.findById(ownerId, id);
    if (!asset) throw new ApiError("File not found", HttpStatusCode.NOT_FOUND);
    await fileRepository.recordDownload({
      ownerId,
      fileId: id,
      ipAddress: request.ip,
      userAgent: request.userAgent,
    });
    return asset;
  },
  async remove(ownerId: string, id: string) {
    const asset = await fileRepository.findById(ownerId, id);
    if (!asset) throw new ApiError("File not found", HttpStatusCode.NOT_FOUND);
    await storage.delete(asset.providerKey);
    await fileRepository.delete(ownerId, id);
  },
};
