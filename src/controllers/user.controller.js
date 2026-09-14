const userService = require("../services/user.service");
const asyncHandler = require("../middleware/asyncHandler");

const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);

  res.status(201).json({
    success: true,
    message: "user created successfully",
    data: user,
  });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await userService.getAllUsers();

  res.status(200).json({
    success: true,
    data: users,
  });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);

  if (!user) {
    const error = new Error("user not found");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);

  if (!user) {
    const error = new Error("user not found");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    message: "user updated successfully",
    data: user,
  });
});

const deactivateUser = asyncHandler(async (req, res) => {
  const user = await userService.setUserActiveStatus(req.params.id, false);

  if (!user) {
    const error = new Error("user not found");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    message: "user deactivated successfully",
    data: user,
  });
});

const activateUser = asyncHandler(async (req, res) => {
  const user = await userService.setUserActiveStatus(req.params.id, true);

  if (!user) {
    const error = new Error("user not found");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    message: "user activated successfully",
    data: user,
  });
});

// Admin/manager resets someone else's password directly (no need to know
// the old one) — access to this route must be restricted by role.
const resetUserPassword = asyncHandler(async (req, res) => {
  const user = await userService.setPassword(
    req.params.id,
    req.body.newPassword,
  );

  if (!user) {
    const error = new Error("user not found");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    message: "password reset successfully",
    data: user,
  });
});

// The logged-in user changes their own password, proving they know the
// current one first.
const changeOwnPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const result = await userService.changeOwnPassword(
    req.params.id,
    currentPassword,
    newPassword,
  );

  if (!result.success && result.reason === "NOT_FOUND") {
    const error = new Error("user not found");
    error.statusCode = 404;
    throw error;
  }

  if (!result.success && result.reason === "INCORRECT_CURRENT_PASSWORD") {
    const error = new Error("current password is incorrect");
    error.statusCode = 401;
    throw error;
  }

  res.status(200).json({
    success: true,
    message: "password changed successfully",
    data: result.user,
  });
});

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deactivateUser,
  activateUser,
  resetUserPassword,
  changeOwnPassword,
};
