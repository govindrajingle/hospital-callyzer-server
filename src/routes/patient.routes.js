const express = require("express");

const patientController = require("../controllers/patient.controller");
const {
  validateCreatePatient,
  validateUpdatePatient,
} = require("../validations/patient.validation");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Every route in this file requires a valid, logged-in user — patient data
// must never be reachable without authentication, and hospitalId for every
// operation comes from the token, not from the client.
router.use(authMiddleware);

router.post("/", validateCreatePatient, patientController.createPatient);

router.get("/", patientController.getAllPatients);

router.get("/search", patientController.searchPatients);

router.get("/check-duplicate", patientController.checkDuplicate);

router.get("/:id", patientController.getPatientById);

router.put("/:id", validateUpdatePatient, patientController.updatePatient);

router.patch("/:id/deactivate", patientController.deactivatePatient);

router.patch("/:id/activate", patientController.activatePatient);

module.exports = router;
