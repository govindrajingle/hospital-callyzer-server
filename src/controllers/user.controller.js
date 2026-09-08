const userService = require("../services/user.service");
const asyncHandler = require("../middleware/asyncHandler");

const createUser = asyncHandler(async (req, res) => {
  console.log("req.body\n", req.body);
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

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
};
