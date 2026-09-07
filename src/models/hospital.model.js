const { pool } = require("../config/database");

// POST   /api/hospitals
// GET    /api/hospitals
// GET    /api/hospitals/:id

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

module.exports = {
  createHospital,
  getAllHospitals,
  getHospitalById,
};
