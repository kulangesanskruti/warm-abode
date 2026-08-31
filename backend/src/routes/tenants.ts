import { Router } from "express";
import { tenantController } from "../controllers/tenantController";
import { authenticate } from "../middlewares/auth";
import { asyncHandler } from "../utils/errors";

const router = Router();

/**
 * @route POST /api/v1/tenants
 * @description Create new tenant and assign bed
 * @access Protected
 * @body {fullName, phone, email, gender, occupation, emergencyContact, emergencyPhone, permanentAddress, photoUrl?, monthlyRent, securityDeposit, moveInDate, expectedVacateDate?, propertyId, roomId, bedId, notes?}
 * @returns {tenant}
 */
router.post(
  "/",
  authenticate,
  asyncHandler((req, res) => tenantController.createTenant(req, res)),
);

/**
 * @route GET /api/v1/tenants/:id
 * @description Get tenant with documents and timeline
 * @access Protected
 * @returns {tenant, documents, activityLogs}
 */
router.get(
  "/:id",
  authenticate,
  asyncHandler((req, res) => tenantController.getTenant(req, res)),
);

/**
 * @route GET /api/v1/tenants
 * @description Get all tenants with search, filter, pagination
 * @access Protected
 * @query {search?, status?, paymentStatus?, propertyId?, roomId?, page, limit, sortBy, sortOrder}
 * @returns {tenants[], pagination}
 */
router.get(
  "/",
  authenticate,
  asyncHandler((req, res) => tenantController.getAllTenants(req, res)),
);

/**
 * @route PUT /api/v1/tenants/:id
 * @description Update tenant information
 * @access Protected
 * @body {fullName?, phone?, email?, gender?, occupation?, emergencyContact?, emergencyPhone?, permanentAddress?, photoUrl?, monthlyRent?, securityDeposit?, expectedVacateDate?, notes?}
 * @returns {tenant}
 */
router.put(
  "/:id",
  authenticate,
  asyncHandler((req, res) => tenantController.updateTenant(req, res)),
);

/**
 * @route POST /api/v1/tenants/:id/transfer
 * @description Transfer tenant to different bed
 * @access Protected
 * @body {newBedId, newRoomId, newPropertyId, reason?}
 * @returns {tenant}
 */
router.post(
  "/:id/transfer",
  authenticate,
  asyncHandler((req, res) => tenantController.transferBed(req, res)),
);

/**
 * @route POST /api/v1/tenants/:id/vacate
 * @description Vacate tenant from bed
 * @access Protected
 * @body {vacatingDate, reason, securityDepositReturned, finalNotes?}
 * @returns {tenant}
 */
router.post(
  "/:id/vacate",
  authenticate,
  asyncHandler((req, res) => tenantController.vacateTenant(req, res)),
);

/**
 * @route POST /api/v1/tenants/:id/documents
 * @description Upload tenant document
 * @access Protected
 * @body {documentType, documentUrl, notes?}
 * @returns {document}
 */
router.post(
  "/:id/documents",
  authenticate,
  asyncHandler((req, res) => tenantController.uploadDocument(req, res)),
);

/**
 * @route DELETE /api/v1/tenants/:id
 * @description Soft delete tenant (only if not active)
 * @access Protected
 * @returns {success message}
 */
router.delete(
  "/:id",
  authenticate,
  asyncHandler((req, res) => tenantController.deleteTenant(req, res)),
);

export default router;
