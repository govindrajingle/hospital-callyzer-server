const express = require("express");

const userController = require("../controllers/user.controller");

const { validateCreateUser } = require("../validations/user.validation");

const router = express.Router();

router.post("/", validateCreateUser, userController.createUser);
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);

module.exports = router;
