const userRelationshipService = require("../services/userrelationship.service");
const asyncHandler = require("../middleware/asyncHandler");

const createUserRelationship = asyncHandler(async (req, res) => {
  const userRelationship = await userRelationshipService.createUserRelationship(
    req.body,
  );

  res.status(201).json({
    success: true,
    message: "user relationship created successfully",
    data: userRelationship,
  });
});

const getAllUserRelationships = asyncHandler(async (req, res) => {
  const userRelationships =
    await userRelationshipService.getAllUserRelationships();

  res.status(200).json({
    success: true,
    data: userRelationships,
  });
});

const getUserRelationshipsBySeniorId = asyncHandler(async (req, res) => {
  const userRelationships =
    await userRelationshipService.getUserRelationshipsBySeniorId(
      req.params.seniorId,
    );

  res.status(200).json({
    success: true,
    data: userRelationships,
  });
});

const getUserRelationshipsByJuniorId = asyncHandler(async (req, res) => {
  const userRelationships =
    await userRelationshipService.getUserRelationshipsByJuniorId(
      req.params.juniorId,
    );

  res.status(200).json({
    success: true,
    data: userRelationships,
  });
});

const deleteUserRelationship = asyncHandler(async (req, res) => {
  const deleted = await userRelationshipService.deleteUserRelationship(
    req.params.id,
  );

  if (!deleted) {
    const error = new Error("user relationship not found");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    message: "user relationship deleted successfully",
    data: deleted,
  });
});

module.exports = {
  createUserRelationship,
  getAllUserRelationships,
  getUserRelationshipsBySeniorId,
  getUserRelationshipsByJuniorId,
  deleteUserRelationship,
};
