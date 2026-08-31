import { Request, Response } from "express";
import { fileListSchema } from "../validators/file";
import { fileService } from "../services/fileService";
import { fileRepository } from "../repositories/fileRepository";

const ownerId = (req: Request) => req.user!.userId;
const category = (req: Request) => String(req.body.category || "ATTACHMENT") as any;
const entityType = (req: Request) => String(req.body.entityType || "OTHER") as any;

export const fileController = {
  async upload(req: Request, res: Response) {
    if (!req.file) {
      res.status(400).json({ success: false, message: "A file is required" });
      return;
    }
    const asset = await fileService.upload(ownerId(req), req.file, {
      category: category(req),
      entityType: entityType(req),
      entityId: req.body.entityId,
      propertyId: req.body.propertyId,
      tenantId: req.body.tenantId,
      expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : undefined,
      isCover: req.body.isCover === "true" || req.body.isCover === true,
    });
    res.status(201).json({ success: true, data: asset });
  },
  async list(req: Request, res: Response) {
    const query = fileListSchema.parse(req.query);
    res.json({ success: true, data: await fileRepository.list(ownerId(req), query) });
  },
  async get(req: Request, res: Response) {
    res.json({
      success: true,
      data: await fileService.get(ownerId(req), String(req.params.id), {
        ip: req.ip,
        userAgent: req.get("user-agent") || undefined,
      }),
    });
  },
  async remove(req: Request, res: Response) {
    await fileService.remove(ownerId(req), String(req.params.id));
    res.status(204).send();
  },
};
