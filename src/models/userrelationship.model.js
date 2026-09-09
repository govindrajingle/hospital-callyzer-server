const {pool} = require("../config/database");
const {createHospital} = require("./hospital.model");

const createUserRelationship = async (useRelationship) => {
    const {hospitalId, seniorId, juniorId} = useRelationship;
    const query = `insert into user_relationship (hospital_id, senior_id, junior_id)
                   values ($1, $2, $3, $4) returning *`;
    const values = [hospitalId, seniorId, juniorId];
    const result = await pool.query(query, values);
    return result.rows[0];
}

const getAllUserRelationships = async () => {
    const query = `select *
                   from user_relationship;`
    const result = await pool.query(query);
    return result.rows;
}

const getUserRelationshipBySeniorId = async (seniorId) => {
    const query = `select *
                   from user_relationship
                   where senior_user_id = $1;`;
    const result = await pool.query(query, [seniorId]);
    return result.rows[0];
}

const getUserRelationshipByJuniorId = async (juniorId) => {
    const query = `select *
                   from user_relationship
                   where junior_user_id = $1;`;
    const result = await pool.query(query, [juniorId]);
    return result.rows[0];
}

module.exports = {
    createUserRelationship, getAllUserRelationships, getUserRelationshipByJuniorId, getUserRelationshipBySeniorId
}