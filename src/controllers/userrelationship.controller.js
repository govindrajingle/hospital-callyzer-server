const userRelationshipService = require("../services/userrelationship.service");
const asyncHandler = require("../middleware/asyncHandler");

const createUserRelationship = asyncHandler(async (req, res) => {
    const userRelationship = await userRelationshipService.create(req.body);
    res.status(201).json({
        success: true,
        message: "user relationship created successfully",
        data: userRelationship
    });
})

const getAllUserRelationships = asyncHandler(async (req, res) => {
    const userRelationships = await userRelationshipService.getAllUserRelationships();
    res.status(200).json({
        success: true,
        data: userRelationships
    })
})

const getUserRelationshipBySeniorId = asyncHandler(async (req, res) => {
    const userRelationship = await userRelationshipService.getUserRelationshipBySeniorId(req.params.seniorId);
    if(!userRelationship) {
        const error = new Error(`UserRelationship with seniorId ${req.params.seniorId} not found`);
        error.statusCode = 404;
        throw error;
    }
    res.status(200).json({
        success: true,
        data: userRelationship
    })
})
const getUserRelationshipByJuniorId = asyncHandler(async (req, res) => {
    const userRelationship = await userRelationshipService.getUserRelationshipByJuniorId(req.params.juniorId);
    if(!userRelationship) {
        const error = new Error(`UserRelationship with juniorId ${req.params.seniorId} not found`);
        error.statusCode = 404;
        throw error;
    }
    res.status(200).json({
        success: true,
        data: userRelationship
    })
})

module.exports = {
    createUserRelationship, getAllUserRelationships, getUserRelationshipBySeniorId, getUserRelationshipByJuniorId
}