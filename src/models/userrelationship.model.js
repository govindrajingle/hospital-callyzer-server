const { pool } = require("../config/database");

// POST   /api/users-relationship
// GET    /api/users-relationship
// GET    /api/users-relationship/senior-id/:seniorId
// GET    /api/users-relationship/junior-id/:juniorId
// DELETE /api/users-relationship/:id

const createUserRelationship = async (userRelationship) => {
  const { hospitalId, seniorUserId, juniorUserId } = userRelationship;

  const query = `
        INSERT INTO user_relationship
            (hospital_id, senior_user_id, junior_user_id)
        VALUES
            ($1, $2, $3)
        RETURNING *;
    `;

  const values = [hospitalId, seniorUserId, juniorUserId];

  const result = await pool.query(query, values);

  return result.rows[0];
};

const getAllUserRelationships = async () => {
  const query = `
        SELECT *
        FROM user_relationship
        ORDER BY id;
    `;

  const result = await pool.query(query);

  return result.rows;
};

const getUserRelationshipsBySeniorId = async (seniorId) => {
  const query = `
        SELECT *
        FROM user_relationship
        WHERE senior_user_id = $1
        ORDER BY id;
    `;

  const result = await pool.query(query, [seniorId]);

  return result.rows;
};

const getUserRelationshipsByJuniorId = async (juniorId) => {
  const query = `
        SELECT *
        FROM user_relationship
        WHERE junior_user_id = $1
        ORDER BY id;
    `;

  const result = await pool.query(query, [juniorId]);

  return result.rows;
};

const getUserRelationshipById = async (id) => {
  const query = `
        SELECT *
        FROM user_relationship
        WHERE id = $1;
    `;

  const result = await pool.query(query, [id]);

  return result.rows[0];
};

const deleteUserRelationship = async (id) => {
  const query = `
        DELETE FROM user_relationship
        WHERE id = $1
        RETURNING *;
    `;

  const result = await pool.query(query, [id]);

  return result.rows[0];
};

module.exports = {
  createUserRelationship,
  getAllUserRelationships,
  getUserRelationshipsBySeniorId,
  getUserRelationshipsByJuniorId,
  getUserRelationshipById,
  deleteUserRelationship,
};
