const hospitalModel = require("../models/hospital.model");

const createHospital = async (hospitalData) => {
  return await hospitalModel.createHospital(hospitalData);
};

const getAllHospitals = async () => {
  return await hospitalModel.getAllHospitals();
};

const getHospitalById = async (id) => {
  return await hospitalModel.getHospitalById(id);
};

module.exports = {
  createHospital,
  getAllHospitals,
  getHospitalById,
};
