const { pool } = require("../config/database");

const getNextMrnSequence = async (hospitalId) => {
  const query = `
        INSERT INTO patient_mrn_sequence (hospital_id, last_number)
        VALUES ($1, 1)
        ON CONFLICT (hospital_id)
        DO UPDATE SET last_number = patient_mrn_sequence.last_number + 1
        RETURNING last_number;
    `;
  const result = await pool.query(query, [hospitalId]);
  return result.rows[0].last_number;
};

const createPatient = async (patient) => {
  const {
    hospitalId,
    mrn,
    firstName,
    middleName,
    lastName,
    dateOfBirth,
    gender,
    mobile,
    email,
    address,
    street,
    locality,
    landmark,
    city,
    state,
    pinCode,
    country,
    telephoneResidence,
    telephoneOffice,
    faxNumber,
    preferredContactTime,
    bloodGroup,
    occupation,
    maritalStatus,
    planType,
    planExpiresDate,
    ailment,
    referralSource,
    referralPersonName,
    referralPatientMrn,
    termsAccepted,
    privacyAccepted,
    emergencyContactName,
    emergencyContactNumber,
    governmentIdType,
    governmentIdNumber,
    photoUrl,
    createdBy,
  } = patient;

  const query = `
        INSERT INTO patients
            (hospital_id, mrn, first_name, middle_name, last_name, date_of_birth, gender,
             mobile, email, address, street, locality, landmark, city, state, pin_code, country,
             telephone_residence, telephone_office, fax_number, preferred_contact_time,
             blood_group, occupation, marital_status, plan_type, plan_expires_date, ailment,
             referral_source, referral_person_name, referral_patient_mrn,
             consent_terms, consent_marketing,
             emergency_contact_name, emergency_contact_number,
             government_id_type, government_id_number, photo_url, created_by)
        VALUES
            ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,
             $18,$19,$20,$21,$22,$23,$24,$25,$26,$27,
             $28,$29,$30,
             $31,$32,
             $33,$34,
             $35,$36,$37,$38)
        RETURNING *;
    `;

  const values = [
    hospitalId,
    mrn,
    firstName,
    middleName || null,
    lastName || null,
    dateOfBirth || null,
    gender || null,
    mobile,
    email || null,
    address || null,
    street || null,
    locality || null,
    landmark || null,
    city || null,
    state || null,
    pinCode || null,
    country || null,
    telephoneResidence || null,
    telephoneOffice || null,
    faxNumber || null,
    preferredContactTime || null,
    bloodGroup || null,
    occupation || null,
    maritalStatus || null,
    planType || null,
    planExpiresDate || null,
    ailment || null,
    referralSource || null,
    referralPersonName || null,
    referralPatientMrn || null,
    termsAccepted === true,
    privacyAccepted === true,
    emergencyContactName || null,
    emergencyContactNumber || null,
    governmentIdType || null,
    governmentIdNumber || null,
    photoUrl || null,
    createdBy || null,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

const getAllPatients = async (hospitalId, { limit = 50, offset = 0 } = {}) => {
  const query = `
        SELECT * FROM patients
        WHERE hospital_id = $1 AND is_active = TRUE
        ORDER BY id DESC LIMIT $2 OFFSET $3;
    `;
  const result = await pool.query(query, [hospitalId, limit, offset]);
  return result.rows;
};

const countPatients = async (hospitalId) => {
  const result = await pool.query(
    `SELECT COUNT(*) AS total FROM patients WHERE hospital_id = $1 AND is_active = TRUE;`,
    [hospitalId],
  );
  return parseInt(result.rows[0].total, 10);
};

const getPatientById = async (hospitalId, id) => {
  const result = await pool.query(
    `SELECT * FROM patients WHERE id = $1 AND hospital_id = $2;`,
    [id, hospitalId],
  );
  return result.rows[0];
};

const searchPatients = async (hospitalId, { name, mobile, mrn } = {}) => {
  const conditions = ["hospital_id = $1", "is_active = TRUE"];
  const values = [hospitalId];
  const orConditions = [];

  if (name) {
    values.push(`%${name}%`);
    orConditions.push(
      `(first_name ILIKE $${values.length} OR last_name ILIKE $${values.length})`,
    );
  }
  if (mobile) {
    values.push(mobile);
    orConditions.push(`mobile = $${values.length}`);
  }
  if (mrn) {
    values.push(mrn);
    orConditions.push(`mrn = $${values.length}`);
  }

  let query = `SELECT * FROM patients WHERE ${conditions.join(" AND ")}`;
  if (orConditions.length > 0) query += ` AND (${orConditions.join(" OR ")})`;
  query += " ORDER BY id DESC LIMIT 50;";

  const result = await pool.query(query, values);
  return result.rows;
};

const findPotentialDuplicates = async (hospitalId, mobile, dateOfBirth) => {
  const query = `
        SELECT * FROM patients
        WHERE hospital_id = $1 AND is_active = TRUE AND mobile = $2
          AND ($3::date IS NULL OR date_of_birth = $3::date);
    `;
  const result = await pool.query(query, [
    hospitalId,
    mobile,
    dateOfBirth || null,
  ]);
  return result.rows;
};

const updatePatient = async (hospitalId, id, patient) => {
  const {
    firstName,
    middleName,
    lastName,
    dateOfBirth,
    gender,
    mobile,
    email,
    address,
    street,
    locality,
    landmark,
    city,
    state,
    pinCode,
    country,
    telephoneResidence,
    telephoneOffice,
    faxNumber,
    preferredContactTime,
    bloodGroup,
    occupation,
    maritalStatus,
    planType,
    planExpiresDate,
    ailment,
    referralSource,
    referralPersonName,
    referralPatientMrn,
    termsAccepted,
    privacyAccepted,
    emergencyContactName,
    emergencyContactNumber,
    governmentIdType,
    governmentIdNumber,
    photoUrl,
  } = patient;

  const query = `
        UPDATE patients SET
            first_name=$1, middle_name=$2, last_name=$3, date_of_birth=$4, gender=$5,
            mobile=$6, email=$7, address=$8, street=$9, locality=$10, landmark=$11,
            city=$12, state=$13, pin_code=$14, country=$15,
            telephone_residence=$16, telephone_office=$17, fax_number=$18, preferred_contact_time=$19,
            blood_group=$20, occupation=$21, marital_status=$22, plan_type=$23, plan_expires_date=$24, ailment=$25,
            referral_source=$26, referral_person_name=$27, referral_patient_mrn=$28,
            consent_terms=$29, consent_marketing=$30,
            emergency_contact_name=$31, emergency_contact_number=$32,
            government_id_type=$33, government_id_number=$34, photo_url=$35,
            updated_at = NOW()
        WHERE id = $36 AND hospital_id = $37
        RETURNING *;
    `;

  const values = [
    firstName,
    middleName || null,
    lastName || null,
    dateOfBirth || null,
    gender || null,
    mobile,
    email || null,
    address || null,
    street || null,
    locality || null,
    landmark || null,
    city || null,
    state || null,
    pinCode || null,
    country || null,
    telephoneResidence || null,
    telephoneOffice || null,
    faxNumber || null,
    preferredContactTime || null,
    bloodGroup || null,
    occupation || null,
    maritalStatus || null,
    planType || null,
    planExpiresDate || null,
    ailment || null,
    referralSource || null,
    referralPersonName || null,
    referralPatientMrn || null,
    termsAccepted === true,
    privacyAccepted === true,
    emergencyContactName || null,
    emergencyContactNumber || null,
    governmentIdType || null,
    governmentIdNumber || null,
    photoUrl || null,
    id,
    hospitalId,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

const setPatientActiveStatus = async (hospitalId, id, isActive) => {
  const result = await pool.query(
    `UPDATE patients SET is_active = $1, updated_at = NOW() WHERE id = $2 AND hospital_id = $3 RETURNING *;`,
    [isActive, id, hospitalId],
  );
  return result.rows[0];
};

module.exports = {
  getNextMrnSequence,
  createPatient,
  getAllPatients,
  countPatients,
  getPatientById,
  searchPatients,
  findPotentialDuplicates,
  updatePatient,
  setPatientActiveStatus,
};
