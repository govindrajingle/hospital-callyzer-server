const express = require("express");
const {validateUserRelationship} = require("../validations/userrelation.validation")
const userRelationshipController = require("../controllers/userrelationship.controller");

const router = express.Router();
router.post("/", validateUserRelationship, userRelationshipController.getAllUserRelationships);
router.get("/", userRelationshipController.getAllUserRelationships);
router.get("/senior-id/:seniorId", userRelationshipController.getUserRelationshipBySeniorId);
router.get("/junior-id/:juniorId", userRelationshipController.getUserRelationshipByJuniorId);

module.exports = router;