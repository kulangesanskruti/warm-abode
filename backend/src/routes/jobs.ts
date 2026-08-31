import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth";
import { jobController } from "../controllers/jobController";

const router = Router();
router.use(authenticate);
router.get("/", jobController.list);
router.post("/:id/retry", authorize(["OWNER", "MANAGER"]), jobController.retry);
router.post("/:id/process", authorize(["OWNER", "MANAGER"]), jobController.process);
export default router;
