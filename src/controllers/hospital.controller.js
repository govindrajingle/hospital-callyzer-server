const hospitalService = require("../services/hospital.service");
const asyncHandler = require("../middleware/asyncHandler");

const createHospital = asyncHandler(async (req, res) => {
  const hospital = await hospitalService.createHospital(req.body);

  res.status(201).json({
    success: true,
    message: "hospital created successfully",
    data: hospital,
  });
});

const getAllHospitals = asyncHandler(async (req, res) => {
  const hospitals = await hospitalService.getAllHospitals();

  res.status(200).json({
    success: true,
    data: hospitals,
  });
});

const getHospitalById = asyncHandler(async (req, res) => {
  const hospital = await hospitalService.getHospitalById(req.params.id);

  if (!hospital) {
    const error = new Error("hospital not found");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    data: hospital,
  });
});

module.exports = {
  createHospital,
  getAllHospitals,
  getHospitalById,
};
