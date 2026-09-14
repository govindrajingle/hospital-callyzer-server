const { pool } = require("../config/database");

// POST   /api/role-masters
// GET    /api/role-masters
// GET    /api/role-masters/:id
// PUT    /api/role-masters/:id

const createRolemaster = async (rolemaster) => {
  const { roleName, roleCode, parentRoleId } = rolemaster;

  const query = `
        INSERT INTO role_master
            (role_name, role_code, parent_role_id)
        VALUES
            ($1, $2, $3)
        RETURNING *;
    `;

  const values = [roleName, roleCode, parentRoleId ?? null];

  const result = await pool.query(query, values);

  return result.rows[0];
};

const getAllRolemasters = async () => {
  const query = `
        SELECT *
        FROM role_master
        ORDER BY id;
    `;

  const result = await pool.query(query);

  return result.rows;
};

const getRolemasterById = async (id) => {
  const query = `
        SELECT *
        FROM role_master
        WHERE id = $1;
    `;

  const result = await pool.query(query, [id]);

  return result.rows[0];
};

// Expects the CALLER (service layer) to have already merged in any existing
// values for fields the client didn't send — this function always writes
// exactly what it's given, with no COALESCE ambiguity around null vs
// "not provided".
const updateRolemaster = async (id, rolemaster) => {
  const { roleName, roleCode, parentRoleId } = rolemaster;

  const query = `
        UPDATE role_master
        SET
            role_name = $1,
            role_code = $2,
            parent_role_id = $3
        WHERE id = $4
        RETURNING *;
    `;

  const values = [roleName, roleCode, parentRoleId ?? null, id];

  const result = await pool.query(query, values);

  return result.rows[0];
};

module.exports = {
  createRolemaster,
  getAllRolemasters,
  getRolemasterById,
  updateRolemaster,
};
