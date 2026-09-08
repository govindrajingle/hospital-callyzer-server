const express = require("express");

const rolemasterController = require("../controllers/rolemaster.controller");
const {
  validateCreateRolemaster,
} = require("../validations/rolemaster.validation");

const router = express.Router();

router.post(
  "/",
  validateCreateRolemaster,
  rolemasterController.createRolemaster,
);

module.exports = router;
