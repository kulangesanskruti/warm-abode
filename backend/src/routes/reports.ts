import { Router } from "express";
import { authenticate } from "../middlewares/auth";
import { reportController } from "../controllers/reportController";

const router = Router();
router.use(authenticate);
router.get("/dashboard", reportController.dashboard);
router.post("/generate", reportController.generate);
router.get("/business-health", reportController.health);
router.get("/cashbook", reportController.cashbook);
router.get("/revenue", reportController.revenue);
router.get("/occupancy", reportController.occupancy);
router.get("/receipts/:receiptId/download", reportController.receipt);
router.get("/", reportController.list);
router.get("/:id/download", reportController.download);
router.get("/:id", reportController.details);
router.delete("/:id", reportController.remove);
router.post("/:id/regenerate", reportController.regenerate);
export default router;
