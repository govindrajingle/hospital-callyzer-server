const express = require("express");

const userRelationshipController = require("../controllers/userrelationship.controller");
const {
  validateUserRelationship,
} = require("../validations/userrelation.validation");

const router = express.Router();

router.post(
  "/",
  validateUserRelationship,
  userRelationshipController.createUserRelationship,
);

router.get("/", userRelationshipController.getAllUserRelationships);

router.get(
  "/senior-id/:seniorId",
  userRelationshipController.getUserRelationshipsBySeniorId,
);

router.get(
  "/junior-id/:juniorId",
  userRelationshipController.getUserRelationshipsByJuniorId,
);

router.delete("/:id", userRelationshipController.deleteUserRelationship);

module.exports = router;
