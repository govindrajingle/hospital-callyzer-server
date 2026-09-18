const express = require("express");

const userController = require("../controllers/user.controller");
const {
  validateCreateUser,
  validateUpdateUser,
  validateResetPassword,
  validateChangeOwnPassword,
} = require("../validations/user.validation");
const authMiddleware = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/rbacMiddleware");

const router = express.Router();

// Every authenticated user can change their OWN password (they must prove
// they know the current one \u2014 see changeOwnPassword) \u2014 that's not an
// admin-only action. Everything else in this file (viewing/creating/
// editing/deactivating users, and resetting someone else's password
// without knowing it) is admin-only.
router.patch(
  "/:id/change-password",
  authMiddleware,
  validateChangeOwnPassword,
  userController.changeOwnPassword,
);

// Needed by Receptionist when booking an appointment (doctor dropdown) —
// scoped narrowly (id/name only, DOCTOR role only) rather than opening up
// the full Users list to non-admins.
router.get(
  "/doctors",
  authMiddleware,
  requireRole("ADMIN", "HOSPITAL_ADMIN", "RECEPTIONIST"),
  userController.getDoctors,
);

router.use(authMiddleware, requireRole("ADMIN", "HOSPITAL_ADMIN"));

router.post("/", validateCreateUser, userController.createUser);

router.get("/", userController.getAllUsers);

router.get("/:id", userController.getUserById);

router.put("/:id", validateUpdateUser, userController.updateUser);

router.patch("/:id/deactivate", userController.deactivateUser);

router.patch("/:id/activate", userController.activateUser);

router.patch(
  "/:id/reset-password",
  validateResetPassword,
  userController.resetUserPassword,
);

module.exports = router;
