const userRelationshipModel = require("../models/userrelationship.model");

const createUserRelationship = async (userRelationshipData) => {
    return await userRelationshipModel.createUserRelationship(userRelationshipData);
}

const getAllUserRelationships = async () => {
    return await userRelationshipModel.getAllUserRelationships();
}

const getUserRelationshipByJuniorId = async (juniorId) => {
    return await userRelationshipModel.getUserRelationshipByJuniorId(juniorId);
}

const getUserRelationshipBySeniorId = async (seniorId) => {
    return await userRelationshipModel.getUserRelationshipBySeniorId(seniorId);
}

module.exports = {
    createUserRelationship, getAllUserRelationships, getUserRelationshipBySeniorId, getUserRelationshipByJuniorId
}