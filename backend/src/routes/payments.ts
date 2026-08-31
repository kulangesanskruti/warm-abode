import { Router } from "express";
import { authenticate as authMiddleware } from "../middlewares/auth";
import { paymentController } from "../controllers/paymentController";

const router = Router();

/**
 * @route POST /api/v1/payments/generate-monthly
 * @desc Generate monthly rent for all active tenants
 * @access Private (JWT required)
 */
router.post("/generate-monthly", authMiddleware, paymentController.generateMonthlyRent);

/**
 * @route POST /api/v1/payments/collect
 * @desc Collect rent payment
 * @access Private (JWT required)
 */
router.post("/collect", authMiddleware, paymentController.collectRent);

/**
 * @route POST /api/v1/payments/partial
 * @desc Record partial payment
 * @access Private (JWT required)
 */
router.post("/partial", authMiddleware, paymentController.recordPartialPayment);

/**
 * @route GET /api/v1/payments
 * @desc List all payments
 * @access Private (JWT required)
 */
router.get("/", authMiddleware, paymentController.listPayments);

/**
 * @route GET /api/v1/payments/pending
 * @desc Get pending payments
 * @access Private (JWT required)
 */
router.get("/pending", authMiddleware, paymentController.getPendingPayments);

/**
 * @route GET /api/v1/payments/overdue
 * @desc Get overdue payments
 * @access Private (JWT required)
 */
router.get("/overdue", authMiddleware, paymentController.getOverduePayments);

/**
 * @route GET /api/v1/payments/dashboard
 * @desc Financial dashboard metrics
 * @access Private (JWT required)
 */
router.get("/dashboard", authMiddleware, paymentController.getDashboard);

/**
 * @route GET /api/v1/payments/:id
 * @desc Get payment details
 * @access Private (JWT required)
 */
router.get("/:id", authMiddleware, paymentController.getPaymentDetails);

/**
 * @route PUT /api/v1/payments/:id
 * @desc Update payment
 * @access Private (JWT required)
 */
router.put("/:id", authMiddleware, paymentController.updatePayment);

/**
 * @route POST /api/v1/payments/:id/cancel
 * @desc Cancel payment
 * @access Private (JWT required)
 */
router.post("/:id/cancel", authMiddleware, paymentController.cancelPayment);

/**
 * @route GET /api/v1/payments/history/:tenantId
 * @desc Get tenant payment history
 * @access Private (JWT required)
 */
router.get("/history/:tenantId", authMiddleware, paymentController.getPaymentHistory);

/**
 * @route GET /api/v1/payments/:id/receipt
 * @desc Rent receipt for a collected payment
 * @access Private (JWT required)
 */
router.get("/:id/receipt", authMiddleware, paymentController.getPaymentReceipt);

/**
 * @route GET /api/v1/payments/:id/receipt/pdf
 * @desc Rent receipt as a downloadable PDF
 * @access Private (JWT required)
 */
router.get("/:id/receipt/pdf", authMiddleware, paymentController.getPaymentReceiptPdf);

/**
 * @route GET /api/v1/payments/receipt/:receiptId
 * @desc Get receipt details
 * @access Private (JWT required)
 */
router.get("/receipt/:receiptId", authMiddleware, paymentController.getReceipt);

export default router;
