const authService = require("../services/auth.service");
const asyncHandler = require("../middleware/asyncHandler");

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const result = await authService.login(username, password);

  if (!result.success) {
    const messages = {
      INVALID_CREDENTIALS: "invalid username or password",
      ACCOUNT_INACTIVE: "this account has been deactivated",
      NO_PASSWORD_SET: "no password set for this account, contact your admin",
    };

    const error = new Error(messages[result.reason] || "login failed");
    error.statusCode = 401;
    throw error;
  }

  res.status(200).json({
    success: true,
    message: "login successful",
    data: {
      token: result.token,
      user: result.user,
    },
  });
});

module.exports = {
  login,
};
