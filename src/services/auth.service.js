const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const rolemasterModel = require("../models/rolemaster.model");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";

const login = async (username, password) => {
  const user = await userModel.getUserByUsernameWithPasswordHash(username);

  if (!user) {
    return { success: false, reason: "INVALID_CREDENTIALS" };
  }

  if (!user.is_active) {
    return { success: false, reason: "ACCOUNT_INACTIVE" };
  }

  if (!user.password_hash) {
    // A user record that was created before passwords existed, or one
    // whose password was never set — surfaced as its own reason so the
    // frontend can show "contact your admin" instead of a generic error.
    return { success: false, reason: "NO_PASSWORD_SET" };
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    return { success: false, reason: "INVALID_CREDENTIALS" };
  }

  // Role CODE (e.g. "DOCTOR") is embedded directly in the token so the RBAC
  // middleware can check it on every request without an extra DB lookup.
  const role = await rolemasterModel.getRolemasterById(user.role_id);

  const tokenPayload = {
    userId: user.id,
    hospitalId: user.hospital_id,
    roleId: user.role_id,
    roleCode: role ? role.role_code : null,
    username: user.username,
  };

  const token = jwt.sign(tokenPayload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  return {
    success: true,
    token,
    user: {
      id: user.id,
      hospitalId: user.hospital_id,
      roleId: user.role_id,
      roleCode: role ? role.role_code : null,
      username: user.username,
      fullName: user.full_name,
      email: user.email,
    },
  };
};

module.exports = {
  login,
};
