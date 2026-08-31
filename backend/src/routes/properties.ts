import { Router } from "express";
import { propertyController } from "../controllers/propertyController";
import { authenticate } from "../middlewares/auth";
import { asyncHandler } from "../utils/errors";

const router = Router();

// All property endpoints require authentication
router.use(authenticate);

/**
 * @route POST /api/v1/properties
 * @description Create a new property
 * @access Protected
 * @body {propertyName, propertyType, address, city, state, pincode, country, totalFloors, description?, imageUrl?}
 * @returns {property object}
 */
router.post(
  "/",
  asyncHandler((req, res) => propertyController.createProperty(req, res)),
);

/**
 * @route GET /api/v1/properties
 * @description Get all properties with filters and pagination
 * @access Protected
 * @query {page?, limit?, search?, sort?, order?, status?, city?, propertyType?}
 * @returns {properties array with pagination}
 */
router.get(
  "/",
  asyncHandler((req, res) => propertyController.getAllProperties(req, res)),
);

/**
 * @route GET /api/v1/properties/:id
 * @description Get property details by ID
 * @access Protected
 * @params {id - property ID}
 * @returns {property object with aggregated data}
 */
router.get(
  "/:id",
  asyncHandler((req, res) => propertyController.getPropertyById(req, res)),
);

/**
 * @route PUT /api/v1/properties/:id
 * @description Update property
 * @access Protected
 * @params {id - property ID}
 * @body {propertyName?, propertyType?, address?, city?, state?, pincode?, country?, totalFloors?, description?, imageUrl?, status?}
 * @returns {updated property object}
 */
router.put(
  "/:id",
  asyncHandler((req, res) => propertyController.updateProperty(req, res)),
);

/**
 * @route DELETE /api/v1/properties/:id
 * @description Delete property (soft by default, permanent with ?permanent=true)
 * @access Protected
 * @params {id - property ID}
 * @returns {success message}
 */
router.delete(
  "/:id",
  asyncHandler((req, res) => propertyController.deleteProperty(req, res)),
);

/**
 * @route POST /api/v1/properties/:id/image
 * @description Upload property image
 * @access Protected
 * @params {id - property ID}
 * @body {imageUrl}
 * @returns {updated property object}
 */
router.post(
  "/:id/image",
  asyncHandler((req, res) => propertyController.uploadImage(req, res)),
);

export default router;
