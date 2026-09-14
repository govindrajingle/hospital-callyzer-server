const userRelationshipModel = require("../models/userrelationship.model");

const createUserRelationship = async (userRelationshipData) => {
  return await userRelationshipModel.createUserRelationship(
    userRelationshipData,
  );
};

const getAllUserRelationships = async () => {
  return await userRelationshipModel.getAllUserRelationships();
};

const getUserRelationshipsBySeniorId = async (seniorId) => {
  return await userRelationshipModel.getUserRelationshipsBySeniorId(seniorId);
};

const getUserRelationshipsByJuniorId = async (juniorId) => {
  return await userRelationshipModel.getUserRelationshipsByJuniorId(juniorId);
};

const getUserRelationshipById = async (id) => {
  return await userRelationshipModel.getUserRelationshipById(id);
};

const deleteUserRelationship = async (id) => {
  return await userRelationshipModel.deleteUserRelationship(id);
};

module.exports = {
  createUserRelationship,
  getAllUserRelationships,
  getUserRelationshipsBySeniorId,
  getUserRelationshipsByJuniorId,
  getUserRelationshipById,
  deleteUserRelationship,
};
