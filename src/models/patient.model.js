const { pool } = require("../config/database");

// POST   /api/patients
// GET    /api/patients
// GET    /api/patients/:id
// GET    /api/patients/search?mobile=&name=&mrn=
// GET    /api/patients/check-duplicate?mobile=&dateOfBirth=
// PUT    /api/patients/:id
// PATCH  /api/patients/:id/deactivate

// Atomically returns the next MRN sequence number for a hospital. Using
// INSERT ... ON CONFLICT DO UPDATE ... RETURNING as a single statement
// means Postgres handles the increment atomically — two simultaneous
// requests for the same hospital cannot both get the same number, which a
// naive "SELECT MAX(...) + 1" approach would be vulnerable to.
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
    bloodGroup,
    occupation,
    maritalStatus,
    planType,
    planExpiresDate,
    ailment,
    referralSource,
    referralPersonName,
    consentTerms,
    consentMarketing,
    emergencyContactName,
    emergencyContactNumber,
    governmentIdType,
    governmentIdNumber,
    photoUrl,
    createdBy,
  } = patient;

  const query = `
        INSERT INTO patients
            (hospital_id, mrn, first_name, last_name, date_of_birth, gender,
             mobile, email, address, street, locality, landmark, city, state,
             pin_code, country, telephone_residence, telephone_office, fax_number,
             blood_group, occupation, marital_status, plan_type, plan_expires_date,
             ailment, referral_source, referral_person_name, consent_terms, consent_marketing,
             emergency_contact_name, emergency_contact_number,
             government_id_type, government_id_number, photo_url, created_by)
        VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
             $15, $16, $17, $18, $19, $20, $21, $22, $23, $24,
             $25, $26, $27, $28, $29,
             $30, $31,
             $32, $33, $34, $35)
        RETURNING *;
    `;

  const values = [
    hospitalId,
    mrn,
    firstName,
    lastName,
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
    bloodGroup || null,
    occupation || null,
    maritalStatus || null,
    planType || null,
    planExpiresDate || null,
    ailment || null,
    referralSource || null,
    referralPersonName || null,
    consentTerms || false,
    consentMarketing || false,
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
        SELECT *
        FROM patients
        WHERE hospital_id = $1 AND is_active = TRUE
        ORDER BY id DESC
        LIMIT $2 OFFSET $3;
    `;

  const result = await pool.query(query, [hospitalId, limit, offset]);

  return result.rows;
};

const countPatients = async (hospitalId) => {
  const query = `
        SELECT COUNT(*) AS total
        FROM patients
        WHERE hospital_id = $1 AND is_active = TRUE;
    `;

  const result = await pool.query(query, [hospitalId]);

  return parseInt(result.rows[0].total, 10);
};

const getPatientById = async (hospitalId, id) => {
  const query = `
        SELECT *
        FROM patients
        WHERE id = $1 AND hospital_id = $2;
    `;

  const result = await pool.query(query, [id, hospitalId]);

  return result.rows[0];
};

// Searches by partial name match OR exact mobile OR exact MRN — any one of
// these being provided is enough; all provided filters are combined with OR
// since a receptionist searching typically only knows one of these at a time.
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

  if (orConditions.length > 0) {
    query += ` AND (${orConditions.join(" OR ")})`;
  }

  query += " ORDER BY id DESC LIMIT 50;";

  const result = await pool.query(query, values);

  return result.rows;
};

// Used before creating a new patient — matches on mobile + date of birth
// together, which is a reasonable proxy for "probably the same person"
// without being so strict it blocks legitimate cases like siblings sharing
// a guardian's phone number (their DOBs would differ).
const findPotentialDuplicates = async (hospitalId, mobile, dateOfBirth) => {
  const query = `
        SELECT *
        FROM patients
        WHERE hospital_id = $1
          AND is_active = TRUE
          AND mobile = $2
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
    bloodGroup,
    occupation,
    maritalStatus,
    planType,
    planExpiresDate,
    ailment,
    referralSource,
    referralPersonName,
    consentTerms,
    consentMarketing,
    emergencyContactName,
    emergencyContactNumber,
    governmentIdType,
    governmentIdNumber,
    photoUrl,
  } = patient;

  const query = `
        UPDATE patients
        SET
            first_name = $1,
            last_name = $2,
            date_of_birth = $3,
            gender = $4,
            mobile = $5,
            email = $6,
            address = $7,
            street = $8,
            locality = $9,
            landmark = $10,
            city = $11,
            state = $12,
            pin_code = $13,
            country = $14,
            telephone_residence = $15,
            telephone_office = $16,
            fax_number = $17,
            blood_group = $18,
            occupation = $19,
            marital_status = $20,
            plan_type = $21,
            plan_expires_date = $22,
            ailment = $23,
            referral_source = $24,
            referral_person_name = $25,
            consent_terms = $26,
            consent_marketing = $27,
            emergency_contact_name = $28,
            emergency_contact_number = $29,
            government_id_type = $30,
            government_id_number = $31,
            photo_url = $32,
            updated_at = NOW()
        WHERE id = $33 AND hospital_id = $34
        RETURNING *;
    `;

  const values = [
    firstName,
    lastName,
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
    bloodGroup || null,
    occupation || null,
    maritalStatus || null,
    planType || null,
    planExpiresDate || null,
    ailment || null,
    referralSource || null,
    referralPersonName || null,
    consentTerms || false,
    consentMarketing || false,
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
  const query = `
        UPDATE patients
        SET is_active = $1, updated_at = NOW()
        WHERE id = $2 AND hospital_id = $3
        RETURNING *;
    `;

  const result = await pool.query(query, [isActive, id, hospitalId]);

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
