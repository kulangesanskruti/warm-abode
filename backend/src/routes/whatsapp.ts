import { Router } from "express";
import { whatsappController } from "../controllers/whatsappController";
import { authenticate } from "../middlewares/auth";
import { asyncHandler } from "../utils/errors";

const router = Router();
router.use(authenticate);
router.post(
  "/send",
  asyncHandler((req, res) => whatsappController.send(req, res)),
);
router.post(
  "/reminder",
  asyncHandler((req, res) => whatsappController.reminder(req, res)),
);
router.post(
  "/receipt",
  asyncHandler((req, res) => whatsappController.receipt(req, res)),
);
router.post(
  "/share-room",
  asyncHandler((req, res) => whatsappController.shareRoom(req, res)),
);
router.post(
  "/broadcast",
  asyncHandler((req, res) => whatsappController.broadcast(req, res)),
);
router.post(
  "/schedule",
  asyncHandler((req, res) => whatsappController.schedule(req, res)),
);
router.get(
  "/history",
  asyncHandler((req, res) => whatsappController.history(req, res)),
);
router.get(
  "/templates",
  asyncHandler((req, res) => whatsappController.templates(req, res)),
);
router.post(
  "/templates",
  asyncHandler((req, res) => whatsappController.createTemplate(req, res)),
);
router.put(
  "/templates/:id",
  asyncHandler((req, res) => whatsappController.updateTemplate(req, res)),
);
export default router;
