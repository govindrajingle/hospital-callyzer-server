const userModel = require("../models/user.model");

const createUser = async (userData) => {
  return await userModel.createUser(userData);
};

const getAllUsers = async () => {
  return await userModel.getAllUsers();
};

const getUserById = async (id) => {
  return await userModel.getUserById([id]);
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
};
