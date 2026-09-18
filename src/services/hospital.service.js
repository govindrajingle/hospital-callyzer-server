const hospitalModel = require("../models/hospital.model");
const appointmentTypeModel = require("../models/appointmenttype.model");

const DEFAULT_APPOINTMENT_TYPES = ["Consultation", "Surgery", "Other"];

const createHospital = async (hospitalData) => {
  const hospital = await hospitalModel.createHospital(hospitalData);

  // Seeds the three baseline categories from the handwritten schema
  // ("consultation, surgery, other") so the very first appointment booked
  // at a new hospital doesn't need a "confirm new category?" prompt for
  // something this ordinary — only genuinely new categories should ask.
  for (const typeName of DEFAULT_APPOINTMENT_TYPES) {
    await appointmentTypeModel.createType(hospital.id, typeName, { isSystemDefault: true });
  }

  return hospital;
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
