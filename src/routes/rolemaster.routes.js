const express = require("express");

const rolemasterController = require("../controllers/rolemaster.controller");
const {
  validateCreateRolemaster,
  validateUpdateRolemaster,
} = require("../validations/rolemaster.validation");

const router = express.Router();

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
