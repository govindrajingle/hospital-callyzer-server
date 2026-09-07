const express = require("express");

const hospitalController = require("../controllers/hospital.controller");
const {
  validateCreateHospital,
} = require("../validations/hospital.validation");

const router = express.Router();

router.post("/", validateCreateHospital, hospitalController.createHospital);

router.get("/", hospitalController.getAllHospitals);

router.get("/:id", hospitalController.getHospitalById);

module.exports = router;
