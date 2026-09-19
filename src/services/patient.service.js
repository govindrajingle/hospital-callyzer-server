const patientModel = require("../models/patient.model");
const hospitalModel = require("../models/hospital.model");

const buildMrn = (hospitalId, sequenceNumber) => {
  const hospitalPart = String(hospitalId).padStart(3, "0");
  const sequencePart = String(sequenceNumber).padStart(6, "0");
  return `SOZO${hospitalPart}-${sequencePart}`;
};

const checkForDuplicates = async (hospitalId, mobile, dateOfBirth) => {
  return await patientModel.findPotentialDuplicates(hospitalId, mobile, dateOfBirth);
};

const createPatient = async (patientData) => {
  const { hospitalId, mobile, dateOfBirth, confirmDuplicate } = patientData;

  if (!confirmDuplicate) {
    const duplicates = await checkForDuplicates(hospitalId, mobile, dateOfBirth);
    if (duplicates.length > 0) {
      return { success: false, reason: "POSSIBLE_DUPLICATE", duplicates };
    }
  }

  const hospital = await hospitalModel.getHospitalById(hospitalId);
  if (!hospital) {
    return { success: false, reason: "HOSPITAL_NOT_FOUND" };
  }

  const sequenceNumber = await patientModel.getNextMrnSequence(hospitalId);
  const mrn = buildMrn(hospitalId, sequenceNumber);

  const patient = await patientModel.createPatient({ ...patientData, mrn });
  return { success: true, patient };
};

const getAllPatients = async (hospitalId, pagination) => {
  const patients = await patientModel.getAllPatients(hospitalId, pagination);
  const total = await patientModel.countPatients(hospitalId, { includeInactive: pagination?.includeInactive });
  return { patients, total };
};

const getPatientById = async (hospitalId, id) => {
  return await patientModel.getPatientById(hospitalId, id);
};

const searchPatients = async (hospitalId, filters) => {
  return await patientModel.searchPatients(hospitalId, filters);
};

const FIELD_MAP = [
  ["firstName", "first_name"], ["middleName", "middle_name"], ["lastName", "last_name"],
  ["dateOfBirth", "date_of_birth"], ["gender", "gender"],
  ["mobile", "mobile"], ["email", "email"],
  ["address", "address"], ["street", "street"], ["locality", "locality"], ["landmark", "landmark"],
  ["city", "city"], ["state", "state"], ["pinCode", "pin_code"], ["country", "country"],
  ["telephoneResidence", "telephone_residence"], ["telephoneOffice", "telephone_office"],
  ["faxNumber", "fax_number"], ["preferredContactTime", "preferred_contact_time"],
  ["bloodGroup", "blood_group"], ["occupation", "occupation"], ["maritalStatus", "marital_status"],
  ["planType", "plan_type"], ["planExpiresDate", "plan_expires_date"], ["ailment", "ailment"],
  ["referralSource", "referral_source"], ["referralPersonName", "referral_person_name"],
  ["referralPatientMrn", "referral_patient_mrn"],
  ["consentTerms", "consent_terms"], ["consentMarketing", "consent_marketing"],
  ["emergencyContactName", "emergency_contact_name"], ["emergencyContactNumber", "emergency_contact_number"],
  ["governmentIdType", "government_id_type"], ["governmentIdNumber", "government_id_number"],
  ["photoUrl", "photo_url"],
];

const updatePatient = async (hospitalId, id, updates) => {
  const existing = await patientModel.getPatientById(hospitalId, id);
  if (!existing) return null;

  const merged = {};
  for (const [camelKey, snakeKey] of FIELD_MAP) {
    merged[camelKey] = updates[camelKey] !== undefined ? updates[camelKey] : existing[snakeKey];
  }

  return await patientModel.updatePatient(hospitalId, id, merged);
};

const setPatientActiveStatus = async (hospitalId, id, isActive) => {
  const existing = await patientModel.getPatientById(hospitalId, id);
  if (!existing) return null;
  return await patientModel.setPatientActiveStatus(hospitalId, id, isActive);
};

module.exports = {
  checkForDuplicates, createPatient, getAllPatients, getPatientById,
  searchPatients, updatePatient, setPatientActiveStatus,
};
