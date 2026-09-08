const { pool } = require("../config/database");

const createRolemaster = async (rolemaster) => {
  const { roleName, roleCode, parentRoleId } = rolemaster;
  const query = `insert into role_master (
    role_name, role_code, parent_role_id) values ($1, $2, $3) returning *`;
  const values = [roleName, roleCode, parentRoleId];
  const result = await pool.query(query, values);
  return result.rows[0];
};

module.exports = { createRolemaster };
