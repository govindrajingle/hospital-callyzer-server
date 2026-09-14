const express = require("express");

const hospitalController = require("../controllers/hospital.controller");
const {
  validateCreateHospital,
  validateUpdateHospital,
} = require("../validations/hospital.validation");

const router = express.Router();

router.post("/", validateCreateHospital, hospitalController.createHospital);

router.get("/", hospitalController.getAllHospitals);

router.get("/:id", hospitalController.getHospitalById);

router.put(
  "/:id",
  validateUpdateHospital,
  hospitalController.updateHospital,
);

router.patch("/:id/deactivate", hospitalController.deactivateHospital);

router.patch("/:id/activate", hospitalController.activateHospital);

module.exports = router;
