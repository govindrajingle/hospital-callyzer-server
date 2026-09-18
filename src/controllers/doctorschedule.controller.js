const doctorScheduleService = require("../services/doctorschedule.service");
const asyncHandler = require("../middleware/asyncHandler");

// hospitalId always comes from req.user (the JWT) — same multi-tenant
// isolation rule as every other module here.

const getMine = asyncHandler(async (req, res) => {
  const schedule = await doctorScheduleService.getEffectiveSchedule(req.user.hospitalId, req.user.userId);
  res.status(200).json({ success: true, data: schedule });
});

const updateMine = asyncHandler(async (req, res) => {
  const schedule = await doctorScheduleService.saveSchedule(req.user.hospitalId, req.user.userId, req.body);
  res.status(200).json({ success: true, message: "consultation hours updated successfully", data: schedule });
});

// Admin/Receptionist need this to show "Dr X works 9 AM-9 PM" context on
// the booking form, and Admin can override a doctor's hours on their
// behalf via updateForDoctor below.
const getForDoctor = asyncHandler(async (req, res) => {
  const schedule = await doctorScheduleService.getEffectiveSchedule(req.user.hospitalId, req.params.doctorId);
  res.status(200).json({ success: true, data: schedule });
});

const updateForDoctor = asyncHandler(async (req, res) => {
  const schedule = await doctorScheduleService.saveSchedule(req.user.hospitalId, req.params.doctorId, req.body);
  res.status(200).json({ success: true, message: "consultation hours updated successfully", data: schedule });
});

module.exports = {
  getMine,
  updateMine,
  getForDoctor,
  updateForDoctor,
};
