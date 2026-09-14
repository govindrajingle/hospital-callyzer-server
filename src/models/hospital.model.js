const { pool } = require("../config/database");

// POST   /api/hospitals
// GET    /api/hospitals
// GET    /api/hospitals/:id
// PUT    /api/hospitals/:id
// PATCH  /api/hospitals/:id/deactivate

const createHospital = async (hospital) => {
  const { hospitalName, hospitalCode, address, city, state } = hospital;

  const query = `
        INSERT INTO hospital_master
            (hospital_name, hospital_code, address, city, state)
        VALUES
            ($1, $2, $3, $4, $5)
        RETURNING *;
    `;

  const values = [hospitalName, hospitalCode, address, city, state];

  const result = await pool.query(query, values);

  return result.rows[0];
};

const getAllHospitals = async () => {
  const query = `
        SELECT *
        FROM hospital_master
        ORDER BY id;
    `;

  const result = await pool.query(query);

  return result.rows;
};

const getHospitalById = async (id) => {
  const query = `
        SELECT *
        FROM hospital_master
        WHERE id = $1;
    `;

  const result = await pool.query(query, [id]);

  return result.rows[0];
};

// Expects the service layer to have already merged in existing values for
// any fields the client didn't send.
const updateHospital = async (id, hospital) => {
  const { hospitalName, hospitalCode, address, city, state } = hospital;

  const query = `
        UPDATE hospital_master
        SET
            hospital_name = $1,
            hospital_code = $2,
            address = $3,
            city = $4,
            state = $5
        WHERE id = $6
        RETURNING *;
    `;

  const values = [hospitalName, hospitalCode, address, city, state, id];

  const result = await pool.query(query, values);

  return result.rows[0];
};

const setHospitalActiveStatus = async (id, isActive) => {
  const query = `
        UPDATE hospital_master
        SET is_active = $1
        WHERE id = $2
        RETURNING *;
    `;

  const result = await pool.query(query, [isActive, id]);

  return result.rows[0];
};

module.exports = {
  createHospital,
  getAllHospitals,
  getHospitalById,
  updateHospital,
  setHospitalActiveStatus,
};
