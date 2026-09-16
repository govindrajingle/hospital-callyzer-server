const express = require("express");

const rolemasterController = require("../controllers/rolemaster.controller");
const {
  validateCreateRolemaster,
  validateUpdateRolemaster,
} = require("../validations/rolemaster.validation");
const authMiddleware = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/rbacMiddleware");

const router = express.Router();

// Viewing and managing roles is admin-only, full stop.
router.use(authMiddleware, requireRole("ADMIN", "HOSPITAL_ADMIN"));

router.post(
  "/",
  validateCreateRolemaster,
  rolemasterController.createRolemaster,
);

router.get("/", rolemasterController.getAllRolemasters);

router.get("/:id", rolemasterController.getRolemasterById);

router.put(
  "/:id",
  validateUpdateRolemaster,
  rolemasterController.updateRolemaster,
);

module.exports = router;
