const { pool } = require("../config/database");

// POST   /api/appointments/types  (via appointment.service.resolveType)
// GET    /api/appointments/types

const getTypesByHospital = async (hospitalId) => {
  const query = `
        SELECT id, type_name, is_system_default
        FROM appointment_type_master
        WHERE hospital_id = $1 AND is_active = TRUE
        ORDER BY is_system_default DESC, type_name;
    `;

  const result = await pool.query(query, [hospitalId]);

  return result.rows;
};

const getTypeByName = async (hospitalId, typeName) => {
  const query = `
        SELECT * FROM appointment_type_master
        WHERE hospital_id = $1 AND LOWER(type_name) = LOWER($2);
    `;

  const result = await pool.query(query, [hospitalId, typeName]);

  return result.rows[0];
};

// Re-activates a previously deactivated type instead of erroring on the
// unique constraint if the same name is added again later.
const createType = async (hospitalId, typeName, { isSystemDefault = false } = {}) => {
  const query = `
        INSERT INTO appointment_type_master (hospital_id, type_name, is_system_default)
        VALUES ($1, $2, $3)
        ON CONFLICT (hospital_id, type_name) DO UPDATE SET is_active = TRUE
        RETURNING *;
    `;

  const result = await pool.query(query, [hospitalId, typeName, isSystemDefault]);

  return result.rows[0];
};

module.exports = {
  getTypesByHospital,
  getTypeByName,
  createType,
};
