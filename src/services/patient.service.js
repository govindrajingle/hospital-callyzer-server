const patientModel = require("../models/patient.model");
const hospitalModel = require("../models/hospital.model");

// MRN format: SOZO{hospitalId zero-padded to 3 digits}-{sequence zero-padded
// to 6 digits}, e.g. SOZO001-000022.
//
// Deliberately uses the hospital's numeric id, NOT hospital_code — the code
// is free text a hospital admin can edit later (see hospital.model.js
// updateHospital), so basing the MRN on it would mean an MRN could silently
// stop matching its own hospital's current code. The numeric id never
// changes once a hospital row exists, so it's safe to bake into a
// permanent patient identifier.
//
// If a hospital id ever exceeds 999, padStart does NOT truncate — it just
// stops padding once the number is already 3+ digits long (e.g. hospital id
// 1000 becomes "SOZO1000-000022", still perfectly valid and still globally
// unique, just no longer a fixed width). This is deliberate: correctness
// over fixed-width cosmetics.
const buildMrn = (hospitalId, sequenceNumber) => {
  const hospitalPart = String(hospitalId).padStart(3, "0");
  const sequencePart = String(sequenceNumber).padStart(6, "0");
  return `SOZO${hospitalPart}-${sequencePart}`;
};

const checkForDuplicates = async (hospitalId, mobile, dateOfBirth) => {
  return await patientModel.findPotentialDuplicates(
    hospitalId,
    mobile,
    dateOfBirth,
  );
};

// confirmDuplicate lets the caller (frontend, after showing the user a
// warning) explicitly proceed anyway — e.g. two siblings sharing a
// guardian's phone and birth date is rare but not impossible.
const createPatient = async (patientData) => {
  const { hospitalId, mobile, dateOfBirth, confirmDuplicate } = patientData;

  if (!confirmDuplicate) {
    const duplicates = await checkForDuplicates(
      hospitalId,
      mobile,
      dateOfBirth,
    );

    if (duplicates.length > 0) {
      return {
        success: false,
        reason: "POSSIBLE_DUPLICATE",
        duplicates,
      };
    }
  }

  const hospital = await hospitalModel.getHospitalById(hospitalId);

  if (!hospital) {
    return { success: false, reason: "HOSPITAL_NOT_FOUND" };
  }

  const sequenceNumber = await patientModel.getNextMrnSequence(hospitalId);
  const mrn = buildMrn(hospitalId, sequenceNumber);

  const patient = await patientModel.createPatient({
    ...patientData,
    mrn,
  });

  return { success: true, patient };
};

const getAllPatients = async (hospitalId, pagination) => {
  const patients = await patientModel.getAllPatients(hospitalId, pagination);
  const total = await patientModel.countPatients(hospitalId);

  return { patients, total };
};

const getPatientById = async (hospitalId, id) => {
  return await patientModel.getPatientById(hospitalId, id);
};

const searchPatients = async (hospitalId, filters) => {
  return await patientModel.searchPatients(hospitalId, filters);
};

const updatePatient = async (hospitalId, id, updates) => {
  const existing = await patientModel.getPatientById(hospitalId, id);

  if (!existing) {
    return null;
  }

  const merged = {
    firstName:
      updates.firstName !== undefined
        ? updates.firstName
        : existing.first_name,
    lastName:
      updates.lastName !== undefined ? updates.lastName : existing.last_name,
    dateOfBirth:
      updates.dateOfBirth !== undefined
        ? updates.dateOfBirth
        : existing.date_of_birth,
    gender: updates.gender !== undefined ? updates.gender : existing.gender,
    mobile: updates.mobile !== undefined ? updates.mobile : existing.mobile,
    email: updates.email !== undefined ? updates.email : existing.email,
    address: updates.address !== undefined ? updates.address : existing.address,
    city: updates.city !== undefined ? updates.city : existing.city,
    state: updates.state !== undefined ? updates.state : existing.state,
    bloodGroup:
      updates.bloodGroup !== undefined
        ? updates.bloodGroup
        : existing.blood_group,
    emergencyContactName:
      updates.emergencyContactName !== undefined
        ? updates.emergencyContactName
        : existing.emergency_contact_name,
    emergencyContactNumber:
      updates.emergencyContactNumber !== undefined
        ? updates.emergencyContactNumber
        : existing.emergency_contact_number,
    governmentIdType:
      updates.governmentIdType !== undefined
        ? updates.governmentIdType
        : existing.government_id_type,
    governmentIdNumber:
      updates.governmentIdNumber !== undefined
        ? updates.governmentIdNumber
        : existing.government_id_number,
    photoUrl:
      updates.photoUrl !== undefined ? updates.photoUrl : existing.photo_url,
  };

  return await patientModel.updatePatient(hospitalId, id, merged);
};

const setPatientActiveStatus = async (hospitalId, id, isActive) => {
  const existing = await patientModel.getPatientById(hospitalId, id);

  if (!existing) {
    return null;
  }

  return await patientModel.setPatientActiveStatus(hospitalId, id, isActive);
};

module.exports = {
  checkForDuplicates,
  createPatient,
  getAllPatients,
  getPatientById,
  searchPatients,
  updatePatient,
  setPatientActiveStatus,
};
