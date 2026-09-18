const express = require("express");

const doctorScheduleController = require("../controllers/doctorschedule.controller");
const { validateUpdateSchedule } = require("../validations/doctorschedule.validation");
const authMiddleware = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/rbacMiddleware");

const router = express.Router();

router.use(authMiddleware);

// A doctor setting their own consultation hours master form.
router.get("/mine", requireRole("DOCTOR"), doctorScheduleController.getMine);
router.put("/mine", requireRole("DOCTOR"), validateUpdateSchedule, doctorScheduleController.updateMine);

// Admin/Receptionist need read access for booking-form context; Admin can
// also override a doctor's hours on their behalf.
router.get(
  "/:doctorId",
  requireRole("ADMIN", "HOSPITAL_ADMIN", "RECEPTIONIST"),
  doctorScheduleController.getForDoctor,
);
router.put(
  "/:doctorId",
  requireRole("ADMIN", "HOSPITAL_ADMIN"),
  validateUpdateSchedule,
  doctorScheduleController.updateForDoctor,
);

module.exports = router;
