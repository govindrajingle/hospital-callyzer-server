const appointmentService = require("../services/appointment.service");
const appointmentModel = require("../models/appointment.model");
const asyncHandler = require("../middleware/asyncHandler");

// hospitalId always comes from req.user (the JWT), never from the request
// body/query — same multi-tenant isolation rule as every other module here.

const dateRangeFromQuery = (query) => {
  const view = query.view || "day";
  const anchor = query.date ? new Date(query.date) : new Date();
  let from;
  let to;

  if (view === "day") {
    from = new Date(anchor);
    from.setHours(0, 0, 0, 0);
    to = new Date(from);
    to.setDate(to.getDate() + 1);
  } else if (view === "week") {
    from = new Date(anchor);
    from.setDate(anchor.getDate() - anchor.getDay());
    from.setHours(0, 0, 0, 0);
    to = new Date(from);
    to.setDate(to.getDate() + 7);
  } else {
    from = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    to = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1);
  }

  return { from, to };
};

// Powers the booking form's slot picker — returns the full business-hours
// grid for the day with each slot flagged available/unavailable, so the
// receptionist only ever picks a slot the doctor is actually free for.
const getAvailableSlots = asyncHandler(async (req, res) => {
  const { doctorId, date, excludeAppointmentId } = req.query;

  if (!doctorId || !date) {
    const error = new Error("doctorId and date are required");
    error.statusCode = 400;
    throw error;
  }

  const slots = await appointmentService.getAvailableSlots(
    req.user.hospitalId, doctorId, date, excludeAppointmentId,
  );

  res.status(200).json({ success: true, data: slots });
});

const getTypes = asyncHandler(async (req, res) => {
  const types = await appointmentService.getTypes(req.user.hospitalId);
  res.status(200).json({ success: true, data: types });
});

const createAppointment = asyncHandler(async (req, res) => {
  const result = await appointmentService.createAppointment({
    ...req.body,
    hospitalId: req.user.hospitalId,
    createdBy: req.user.userId,
  });

  if (!result.success && result.reason === "NEW_TYPE_CONFIRMATION_REQUIRED") {
    return res.status(422).json({
      success: false,
      message: `"${result.typeName}" is a new category — confirm to add it to the list.`,
      data: { code: "NEW_TYPE_CONFIRMATION_REQUIRED", typeName: result.typeName },
    });
  }

  if (!result.success && result.reason === "SLOT_CONFLICT") {
    const error = new Error("this doctor already has an appointment booked in that slot");
    error.statusCode = 409;
    throw error;
  }

  res.status(201).json({
    success: true,
    message: "appointment created successfully",
    data: result.appointment,
  });
});

const getAllAppointments = asyncHandler(async (req, res) => {
  const { from, to } = dateRangeFromQuery(req.query);
  const appointments = await appointmentModel.getAppointmentsByHospital(req.user.hospitalId, { from, to });
  res.status(200).json({ success: true, data: appointments });
});

// Doctors only ever see their own appointments — never another doctor's.
const getMyAppointments = asyncHandler(async (req, res) => {
  const { from, to } = dateRangeFromQuery(req.query);
  const appointments = await appointmentModel.getAppointmentsByDoctor(
    req.user.hospitalId, req.user.userId, { from, to },
  );
  res.status(200).json({ success: true, data: appointments });
});

const getAppointmentsByPatient = asyncHandler(async (req, res) => {
  const appointments = await appointmentModel.getAppointmentsByPatient(req.user.hospitalId, req.params.patientId);
  res.status(200).json({ success: true, data: appointments });
});

const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await appointmentModel.getAppointmentById(req.user.hospitalId, req.params.id);
  if (!appointment) {
    const error = new Error("appointment not found");
    error.statusCode = 404;
    throw error;
  }
  const auditTrail = await appointmentModel.getAuditTrail(req.params.id);
  res.status(200).json({ success: true, data: { ...appointment, auditTrail } });
});

// Edited only by Admin/Hospital Admin (enforced in the routes file).
const updateAppointment = asyncHandler(async (req, res) => {
  const result = await appointmentService.updateAppointment(
    req.user.hospitalId, req.params.id, req.body, req.user.userId,
  );

  if (!result.success && result.reason === "NOT_FOUND") {
    const error = new Error("appointment not found");
    error.statusCode = 404;
    throw error;
  }

  if (!result.success && result.reason === "NEW_TYPE_CONFIRMATION_REQUIRED") {
    return res.status(422).json({
      success: false,
      message: `"${result.typeName}" is a new category — confirm to add it to the list.`,
      data: { code: "NEW_TYPE_CONFIRMATION_REQUIRED", typeName: result.typeName },
    });
  }

  if (!result.success && result.reason === "SLOT_CONFLICT") {
    const error = new Error("this doctor already has an appointment booked in that slot");
    error.statusCode = 409;
    throw error;
  }

  res.status(200).json({
    success: true,
    message: "appointment updated successfully",
    data: result.appointment,
  });
});

module.exports = {
  getAvailableSlots,
  getTypes,
  createAppointment,
  getAllAppointments,
  getMyAppointments,
  getAppointmentsByPatient,
  getAppointmentById,
  updateAppointment,
};
