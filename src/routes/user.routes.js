const express = require("express");

const userController = require("../controllers/user.controller");
const {
  validateCreateUser,
  validateUpdateUser,
  validateResetPassword,
  validateChangeOwnPassword,
} = require("../validations/user.validation");

const router = express.Router();

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

router.patch(
  "/:id/change-password",
  validateChangeOwnPassword,
  userController.changeOwnPassword,
);

module.exports = router;
