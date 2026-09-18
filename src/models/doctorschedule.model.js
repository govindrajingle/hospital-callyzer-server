const { pool } = require("../config/database");

// GET  /api/doctor-schedule/mine
// PUT  /api/doctor-schedule/mine
// GET  /api/doctor-schedule/:doctorId
// PUT  /api/doctor-schedule/:doctorId

const getByDoctor = async (hospitalId, doctorId) => {
  const query = `
        SELECT * FROM doctor_schedule
        WHERE hospital_id = $1 AND doctor_id = $2;
    `;

  const result = await pool.query(query, [hospitalId, doctorId]);

  return result.rows[0];
};

// One row per doctor — re-saving just overwrites the existing hours instead
// of erroring on the unique constraint.
const upsertForDoctor = async (hospitalId, doctorId, schedule) => {
  const { startTime, endTime, breakStartTime, breakEndTime } = schedule;

  const query = `
        INSERT INTO doctor_schedule
            (hospital_id, doctor_id, start_time, end_time, break_start_time, break_end_time, updated_at)
        VALUES
            ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT (doctor_id) DO UPDATE SET
            start_time = EXCLUDED.start_time,
            end_time = EXCLUDED.end_time,
            break_start_time = EXCLUDED.break_start_time,
            break_end_time = EXCLUDED.break_end_time,
            updated_at = NOW()
        RETURNING *;
    `;

  const values = [
    hospitalId, doctorId, startTime, endTime,
    breakStartTime || null, breakEndTime || null,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};

module.exports = {
  getByDoctor,
  upsertForDoctor,
};
