const express = require("express");

const hospitalController = require("../controllers/hospital.controller");
const {
  validateCreateHospital,
  validateUpdateHospital,
} = require("../validations/hospital.validation");
const authMiddleware = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/rbacMiddleware");

const router = express.Router();

// Any logged-in user can view hospital info (needed e.g. for the "Hospital"
// dropdown when an admin creates a user) \u2014 only creating/editing/
// deactivating a hospital is admin-only.
router.get("/", authMiddleware, hospitalController.getAllHospitals);
router.get("/:id", authMiddleware, hospitalController.getHospitalById);

router.post(
  "/",
  authMiddleware,
  requireRole("ADMIN"),
  validateCreateHospital,
  hospitalController.createHospital,
);

router.put(
  "/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validateUpdateHospital,
  hospitalController.updateHospital,
);

router.patch(
  "/:id/deactivate",
  authMiddleware,
  requireRole("ADMIN"),
  hospitalController.deactivateHospital,
);

router.patch(
  "/:id/activate",
  authMiddleware,
  requireRole("ADMIN"),
  hospitalController.activateHospital,
);

module.exports = router;
