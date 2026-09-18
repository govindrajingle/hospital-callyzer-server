const bcrypt = require("bcryptjs");
const userModel = require("../models/user.model");

const SALT_ROUNDS = 10;

const createUser = async (userData) => {
  const passwordHash = await bcrypt.hash(userData.password, SALT_ROUNDS);

  return await userModel.createUser({
    ...userData,
    passwordHash,
  });
};

const getAllUsers = async () => {
  return await userModel.getAllUsers();
};

const getUserById = async (id) => {
  return await userModel.getUserById(id);
};

const updateUser = async (id, updates) => {
  const existing = await userModel.getUserById(id);

  if (!existing) {
    return null;
  }

  const merged = {
    fullName:
      updates.fullName !== undefined ? updates.fullName : existing.full_name,
    email: updates.email !== undefined ? updates.email : existing.email,
  };

  return await userModel.updateUser(id, merged);
};

const setUserActiveStatus = async (id, isActive) => {
  const existing = await userModel.getUserById(id);

  if (!existing) {
    return null;
  }

  return await userModel.setUserActiveStatus(id, isActive);
};

// Used by an admin/manager to reset someone else's password directly,
// bypassing the "know your current password" check used in changePassword.
const setPassword = async (id, newPassword) => {
  const existing = await userModel.getUserById(id);

  if (!existing) {
    return null;
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

  return await userModel.setPasswordHash(id, passwordHash);
};

// Used by the logged-in user themself — requires proving they know the
// current password before setting a new one.
const changeOwnPassword = async (id, currentPassword, newPassword) => {
  const userWithHash = await userModel.getUserById(id);

  if (!userWithHash) {
    return { success: false, reason: "NOT_FOUND" };
  }

  // getUserById intentionally does not return password_hash — fetch it
  // via username instead for this one comparison.
  const fullRecord = await userModel.getUserByUsernameWithPasswordHash(
    userWithHash.username,
  );

  const isMatch = await bcrypt.compare(
    currentPassword,
    fullRecord.password_hash,
  );

  if (!isMatch) {
    return { success: false, reason: "INCORRECT_CURRENT_PASSWORD" };
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  const updated = await userModel.setPasswordHash(id, passwordHash);

  return { success: true, user: updated };
};

const getDoctorsByHospital = async (hospitalId) => {
  return await userModel.getDoctorsByHospital(hospitalId);
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  setUserActiveStatus,
  setPassword,
  changeOwnPassword,
  getDoctorsByHospital,
};
