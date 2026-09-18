const pool = require("../config/database");

async function listAll() {
  const res = await pool.query(
    `SELECT role_id, role_code, role_name, parent_role_id, active, creation_time
     FROM role_master ORDER BY role_id`
  );
  return res.rows;
}

async function findById(roleId) {
  const res = await pool.query(`SELECT * FROM role_master WHERE role_id = $1`, [roleId]);
  return res.rows[0] || null;
}

async function findByCode(roleCode) {
  const res = await pool.query(`SELECT * FROM role_master WHERE role_code = $1`, [roleCode]);
  return res.rows[0] || null;
}

async function createRole({ roleCode, roleName, parentRoleId }) {
  const res = await pool.query(
    `INSERT INTO role_master (role_code, role_name, parent_role_id)
     VALUES ($1,$2,$3) RETURNING *`,
    [roleCode, roleName, parentRoleId || null]
  );
  return res.rows[0];
}

async function updateRole(roleId, fields) {
  const sets = [];
  const params = [];
  let idx = 1;
  for (const [col, val] of Object.entries(fields)) {
    sets.push(`${col} = $${idx}`);
    params.push(val);
    idx += 1;
  }
  sets.push(`updation_time = NOW()`);
  params.push(roleId);
  const res = await pool.query(
    `UPDATE role_master SET ${sets.join(", ")} WHERE role_id = $${idx} RETURNING *`,
    params
  );
  return res.rows[0];
}

module.exports = { listAll, findById, findByCode, createRole, updateRole };
