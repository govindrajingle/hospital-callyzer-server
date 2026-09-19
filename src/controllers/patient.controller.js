const patientService = require("../services/patient.service");
const asyncHandler = require("../middleware/asyncHandler");

// hospitalId always comes from the authenticated user's token (req.user),
// NEVER from the request body or query string — otherwise any logged-in
// user could read or write another hospital's patients just by changing a
// parameter. This is the multi-tenant isolation boundary for this module.

const createPatient = asyncHandler(async (req, res) => {
  const result = await patientService.createPatient({
    ...req.body,
    hospitalId: req.user.hospitalId,
    createdBy: req.user.userId,
  });

  if (!result.success && result.reason === "POSSIBLE_DUPLICATE") {
    return res.status(409).json({
      success: false,
      message:
        "a patient with the same mobile number and date of birth already exists",
      data: { possibleDuplicates: result.duplicates },
    });
  }

  if (!result.success && result.reason === "HOSPITAL_NOT_FOUND") {
    const error = new Error("hospital not found");
    error.statusCode = 404;
    throw error;
  }

  res.status(201).json({
    success: true,
    message: "patient registered successfully",
    data: result.patient,
  });
});

const getAllPatients = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 50;
  const offset = parseInt(req.query.offset, 10) || 0;
  const includeInactive = req.query.includeInactive === "true";

  const { patients, total } = await patientService.getAllPatients(
    req.user.hospitalId,
    { limit, offset, includeInactive },
  );

  res.status(200).json({
    success: true,
    data: patients,
    pagination: { limit, offset, total },
  });
});

const getPatientById = asyncHandler(async (req, res) => {
  const patient = await patientService.getPatientById(
    req.user.hospitalId,
    req.params.id,
  );

  if (!patient) {
    const error = new Error("patient not found");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    data: patient,
  });
});

const searchPatients = asyncHandler(async (req, res) => {
  const { name, mobile, mrn } = req.query;
  const includeInactive = req.query.includeInactive === "true";

  const patients = await patientService.searchPatients(req.user.hospitalId, {
    name,
    mobile,
    mrn,
    includeInactive,
  });

  res.status(200).json({
    success: true,
    data: patients,
  });
});

const checkDuplicate = asyncHandler(async (req, res) => {
  const { mobile, dateOfBirth } = req.query;

  const duplicates = await patientService.checkForDuplicates(
    req.user.hospitalId,
    mobile,
    dateOfBirth,
  );

  res.status(200).json({
    success: true,
    data: {
      hasPotentialDuplicates: duplicates.length > 0,
      duplicates,
    },
  });
});

const updatePatient = asyncHandler(async (req, res) => {
  const patient = await patientService.updatePatient(
    req.user.hospitalId,
    req.params.id,
    req.body,
  );

  if (!patient) {
    const error = new Error("patient not found");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    message: "patient updated successfully",
    data: patient,
  });
});

const deactivatePatient = asyncHandler(async (req, res) => {
  const patient = await patientService.setPatientActiveStatus(
    req.user.hospitalId,
    req.params.id,
    false,
  );

  if (!patient) {
    const error = new Error("patient not found");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    message: "patient deactivated successfully",
    data: patient,
  });
});

const activatePatient = asyncHandler(async (req, res) => {
  const patient = await patientService.setPatientActiveStatus(
    req.user.hospitalId,
    req.params.id,
    true,
  );

  if (!patient) {
    const error = new Error("patient not found");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    message: "patient activated successfully",
    data: patient,
  });
});

module.exports = {
  createPatient,
  getAllPatients,
  getPatientById,
  searchPatients,
  checkDuplicate,
  updatePatient,
  deactivatePatient,
  activatePatient,
};
