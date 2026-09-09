const { pool } = require("../config/database");

const createUser = async (user) => {
  const { hospitalId, roleId, userName, fullName, email } = user;

  const query = `insert into users (hospital_id, role_id, username, full_name, email) values ($1, $2, $3, $4, $5) returning *`;

  const values = [hospitalId, roleId, userName, fullName, email];

  const result = await pool.query(query, values);

  return result.rows[0];
};

const getAllUsers = async () => {
  const query = `select * from users order by id`;
  const result = await pool.query(query);
  return result.rows;
};

const getUserById = async (id) => {
  const query = `select * from users where id = $1`;
  const result = await pool.query(query, id);
  return result.rows[0];
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
};
