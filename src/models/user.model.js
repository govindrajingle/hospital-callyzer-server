const { pool } = require("../config/database");

// POST   /api/users
// GET    /api/users
// GET    /api/users/:id
// GET    /api/users/username/:username
// PUT    /api/users/:id
// PATCH  /api/users/:id/deactivate
// PATCH  /api/users/:id/password

const createUser = async (user) => {
  const { hospitalId, roleId, userName, fullName, email, passwordHash } =
    user;

  const query = `
        INSERT INTO users
            (hospital_id, role_id, username, full_name, email, password_hash)
        VALUES
            ($1, $2, $3, $4, $5, $6)
        RETURNING id, hospital_id, role_id, username, full_name, email, is_active, created_at;
    `;

  const values = [hospitalId, roleId, userName, fullName, email, passwordHash];

  const result = await pool.query(query, values);

  return result.rows[0];
};

const getAllUsers = async () => {
  const query = `
        SELECT id, hospital_id, role_id, username, full_name, email, is_active, created_at
        FROM users
        ORDER BY id;
    `;

  const result = await pool.query(query);

  return result.rows;
};

const getUserById = async (id) => {
  const query = `
        SELECT id, hospital_id, role_id, username, full_name, email, is_active, created_at
        FROM users
        WHERE id = $1;
    `;

  const result = await pool.query(query, [id]);

  return result.rows[0];
};

// Deliberately includes password_hash — this is the ONLY query that should
// ever select it, and it's only ever used internally by the login flow.
// Every other query in this file excludes it so the hash never accidentally
// ends up in an API response.
const getUserByUsernameWithPasswordHash = async (username) => {
  const query = `
        SELECT id, hospital_id, role_id, username, full_name, email, password_hash, is_active, created_at
        FROM users
        WHERE username = $1;
    `;

  const result = await pool.query(query, [username]);

  return result.rows[0];
};

// Expects the service layer to have already merged in existing values for
// any fields the client didn't send.
const updateUser = async (id, user) => {
  const { fullName, email } = user;

  const query = `
        UPDATE users
        SET
            full_name = $1,
            email = $2
        WHERE id = $3
        RETURNING id, hospital_id, role_id, username, full_name, email, is_active, created_at;
    `;

  const values = [fullName, email, id];

  const result = await pool.query(query, values);

  return result.rows[0];
};

const setUserActiveStatus = async (id, isActive) => {
  const query = `
        UPDATE users
        SET is_active = $1
        WHERE id = $2
        RETURNING id, hospital_id, role_id, username, full_name, email, is_active, created_at;
    `;

  const result = await pool.query(query, [isActive, id]);

  return result.rows[0];
};

const setPasswordHash = async (id, passwordHash) => {
  const query = `
        UPDATE users
        SET password_hash = $1
        WHERE id = $2
        RETURNING id, hospital_id, role_id, username, full_name, email, is_active, created_at;
    `;

  const result = await pool.query(query, [passwordHash, id]);

  return result.rows[0];
};

// Used by the appointment booking form's doctor dropdown — scoped to the
// caller's own hospital (unlike getAllUsers, which is not currently
// hospital-scoped) and to active DOCTOR-role users only.
const getDoctorsByHospital = async (hospitalId) => {
  const query = `
        SELECT u.id, u.full_name, u.username
        FROM users u
        JOIN role_master r ON r.id = u.role_id
        WHERE u.hospital_id = $1 AND u.is_active = TRUE AND r.role_code = 'DOCTOR'
        ORDER BY u.full_name;
    `;

  const result = await pool.query(query, [hospitalId]);

  return result.rows;
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  getUserByUsernameWithPasswordHash,
  updateUser,
  setUserActiveStatus,
  setPasswordHash,
  getDoctorsByHospital,
};
