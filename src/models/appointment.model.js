const { pool } = require("../config/database");

// POST   /api/appointments
// GET    /api/appointments               (Admin/Receptionist — browse all)
// GET    /api/appointments/mine          (Doctor — own schedule only)
// GET    /api/appointments/patient/:id   (patient profile tabs)
// GET    /api/appointments/:id
// PUT    /api/appointments/:id

// A doctor is double-booked if any active, non-cancelled appointment of
// theirs overlaps the requested [slotStart, slotEnd) window.
const findConflict = async ({ doctorId, slotStart, slotEnd, excludeId }, client = pool) => {
  const values = [doctorId, slotStart, slotEnd];
  let query = `
        SELECT id FROM appointments
        WHERE doctor_id = $1 AND is_active = TRUE AND status != 'cancelled'
          AND slot_start < $3 AND slot_end > $2
    `;

  if (excludeId) {
    values.push(excludeId);
    query += ` AND id != $${values.length}`;
  }

  const result = await client.query(query, values);

  return result.rows;
};

const createAppointment = async (appointment, client = pool) => {
  const {
    hospitalId, patientId, doctorId, receiverId, receiverName,
    slotStart, slotEnd, type, fees, paymentMode, createdBy,
  } = appointment;

  const query = `
        INSERT INTO appointments
            (hospital_id, patient_id, doctor_id, receiver_id, receiver_name,
             slot_start, slot_end, type, fees, payment_mode, status, created_by)
        VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'scheduled', $11)
        RETURNING *;
    `;

  const values = [
    hospitalId, patientId, doctorId, receiverId || null, receiverName || null,
    slotStart, slotEnd, type, fees, paymentMode, createdBy,
  ];

  const result = await client.query(query, values);

  return result.rows[0];
};

const getAppointmentById = async (hospitalId, id) => {
  const query = `
        SELECT a.*, p.mrn, p.first_name AS patient_first_name, p.last_name AS patient_last_name,
               d.full_name AS doctor_name
        FROM appointments a
        JOIN patients p ON p.id = a.patient_id
        JOIN users d ON d.id = a.doctor_id
        WHERE a.id = $1 AND a.hospital_id = $2;
    `;

  const result = await pool.query(query, [id, hospitalId]);

  return result.rows[0];
};

const getAppointmentsByHospital = async (hospitalId, { from, to } = {}) => {
  const values = [hospitalId];
  let query = `
        SELECT a.*, p.mrn, p.first_name AS patient_first_name, p.last_name AS patient_last_name,
               d.full_name AS doctor_name
        FROM appointments a
        JOIN patients p ON p.id = a.patient_id
        JOIN users d ON d.id = a.doctor_id
        WHERE a.hospital_id = $1 AND a.is_active = TRUE
    `;

  if (from && to) {
    values.push(from, to);
    query += ` AND a.slot_start >= $${values.length - 1} AND a.slot_start < $${values.length}`;
  }

  query += " ORDER BY a.slot_start DESC;";

  const result = await pool.query(query, values);

  return result.rows;
};

const getAppointmentsByDoctor = async (hospitalId, doctorId, { from, to }) => {
  const query = `
        SELECT a.*, p.mrn, p.first_name AS patient_first_name, p.last_name AS patient_last_name
        FROM appointments a
        JOIN patients p ON p.id = a.patient_id
        WHERE a.hospital_id = $1 AND a.doctor_id = $2 AND a.is_active = TRUE
          AND a.slot_start >= $3 AND a.slot_start < $4
        ORDER BY a.slot_start;
    `;

  const result = await pool.query(query, [hospitalId, doctorId, from, to]);

  return result.rows;
};

const getAppointmentsByPatient = async (hospitalId, patientId) => {
  const query = `
        SELECT a.*, d.full_name AS doctor_name
        FROM appointments a
        JOIN users d ON d.id = a.doctor_id
        WHERE a.hospital_id = $1 AND a.patient_id = $2 AND a.is_active = TRUE
        ORDER BY a.slot_start DESC;
    `;

  const result = await pool.query(query, [hospitalId, patientId]);

  return result.rows;
};

// Expects the service layer to have already merged in existing values for
// any fields the client didn't send.
const updateAppointment = async (hospitalId, id, appointment, updatedBy) => {
  const {
    doctorId, receiverId, receiverName, slotStart, slotEnd,
    type, fees, paymentMode, status,
  } = appointment;

  const query = `
        UPDATE appointments SET
            doctor_id = $1, receiver_id = $2, receiver_name = $3,
            slot_start = $4, slot_end = $5, type = $6, fees = $7,
            payment_mode = $8, status = $9, updated_by = $10, updated_at = NOW()
        WHERE id = $11 AND hospital_id = $12
        RETURNING *;
    `;

  const values = [
    doctorId, receiverId || null, receiverName || null, slotStart, slotEnd,
    type, fees, paymentMode, status, updatedBy, id, hospitalId,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

const addAuditEntry = async (appointmentId, action, performedBy, details, client = pool) => {
  await client.query(
    `INSERT INTO appointment_audit_log (appointment_id, action, performed_by, details)
     VALUES ($1, $2, $3, $4);`,
    [appointmentId, action, performedBy, details ? JSON.stringify(details) : null],
  );
};

const getAuditTrail = async (appointmentId) => {
  const query = `
        SELECT al.*, u.full_name AS performed_by_name
        FROM appointment_audit_log al
        JOIN users u ON u.id = al.performed_by
        WHERE al.appointment_id = $1
        ORDER BY al.performed_at;
    `;

  const result = await pool.query(query, [appointmentId]);

  return result.rows;
};

module.exports = {
  findConflict,
  createAppointment,
  getAppointmentById,
  getAppointmentsByHospital,
  getAppointmentsByDoctor,
  getAppointmentsByPatient,
  updateAppointment,
  addAuditEntry,
  getAuditTrail,
};
