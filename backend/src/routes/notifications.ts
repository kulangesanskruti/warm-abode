import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import { notificationController } from "../controllers/notificationController";

const router = Router();
router.use(authenticate);
router.get("/unread-count", notificationController.unreadCount);
router.patch("/read-all", notificationController.markAllRead);
router.patch("/:id/read", notificationController.markRead);
router.delete("/:id", notificationController.remove);
router.get("/", notificationController.list);
export default router;
