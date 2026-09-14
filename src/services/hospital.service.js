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

const updateHospital = async (id, updates) => {
  const existing = await hospitalModel.getHospitalById(id);

  if (!existing) {
    return null;
  }

  const merged = {
    hospitalName:
      updates.hospitalName !== undefined
        ? updates.hospitalName
        : existing.hospital_name,
    hospitalCode:
      updates.hospitalCode !== undefined
        ? updates.hospitalCode
        : existing.hospital_code,
    address:
      updates.address !== undefined ? updates.address : existing.address,
    city: updates.city !== undefined ? updates.city : existing.city,
    state: updates.state !== undefined ? updates.state : existing.state,
  };

  return await hospitalModel.updateHospital(id, merged);
};

const setHospitalActiveStatus = async (id, isActive) => {
  const existing = await hospitalModel.getHospitalById(id);

  if (!existing) {
    return null;
  }

  return await hospitalModel.setHospitalActiveStatus(id, isActive);
};

module.exports = {
  createHospital,
  getAllHospitals,
  getHospitalById,
  updateHospital,
  setHospitalActiveStatus,
};
