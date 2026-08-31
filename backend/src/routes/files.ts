import { Router } from "express";
import multer from "multer";
import { authenticate } from "../middlewares/auth";
import { asyncHandler } from "../utils/errors";
import { fileController } from "../controllers/fileController";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024, files: 1 },
});
router.use(authenticate);
router.post(
  "/upload",
  upload.single("file"),
  asyncHandler((req, res) => fileController.upload(req, res)),
);
router.post(
  "/profile-photo",
  upload.single("file"),
  asyncHandler((req, res) => fileController.upload(req, res)),
);
router.post(
  "/property-image",
  upload.single("file"),
  asyncHandler((req, res) => fileController.upload(req, res)),
);
router.post(
  "/tenant-document",
  upload.single("file"),
  asyncHandler((req, res) => fileController.upload(req, res)),
);
router.post(
  "/business-logo",
  upload.single("file"),
  asyncHandler((req, res) => fileController.upload(req, res)),
);
router.post(
  "/business-signature",
  upload.single("file"),
  asyncHandler((req, res) => fileController.upload(req, res)),
);
router.get(
  "/",
  asyncHandler((req, res) => fileController.list(req, res)),
);
router.get(
  "/:id",
  asyncHandler((req, res) => fileController.get(req, res)),
);
router.delete(
  "/:id",
  asyncHandler((req, res) => fileController.remove(req, res)),
);
export default router;
