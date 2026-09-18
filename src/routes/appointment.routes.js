const express = require("express");

const appointmentController = require("../controllers/appointment.controller");
const {
  validateCreateAppointment,
  validateUpdateAppointment,
} = require("../validations/appointment.validation");
const authMiddleware = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/rbacMiddleware");

const router = express.Router();

// Every route needs a logged-in user; hospitalId always comes from the token.
router.use(authMiddleware);

router.get("/types", requireRole("ADMIN", "HOSPITAL_ADMIN", "RECEPTIONIST"), appointmentController.getTypes);

// Doctor's own schedule, filterable by ?view=day|week|month&date=...
router.get("/mine", requireRole("DOCTOR"), appointmentController.getMyAppointments);

// Admin/Receptionist can browse every appointment in the hospital.
router.get("/", requireRole("ADMIN", "HOSPITAL_ADMIN", "RECEPTIONIST"), appointmentController.getAllAppointments);

router.get("/patient/:patientId", appointmentController.getAppointmentsByPatient);

router.get("/:id", appointmentController.getAppointmentById);

// Per the handwritten schema: "created only by receptionist".
router.post(
  "/",
  requireRole("ADMIN", "HOSPITAL_ADMIN", "RECEPTIONIST"),
  validateCreateAppointment,
  appointmentController.createAppointment,
);

// Per the handwritten schema: "edited only by admin".
router.put(
  "/:id",
  requireRole("ADMIN", "HOSPITAL_ADMIN"),
  validateUpdateAppointment,
  appointmentController.updateAppointment,
);

module.exports = router;
