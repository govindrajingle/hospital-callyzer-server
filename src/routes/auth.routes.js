const express = require("express");

const authController = require("../controllers/auth.controller");
const { validateLogin } = require("../validations/auth.validation");

const router = express.Router();

router.post("/login", validateLogin, authController.login);

module.exports = router;
