const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

// Verifies the Bearer token and attaches the decoded payload to req.user.
// Every route that needs to know "who is making this request" (which is
// almost every route except /api/auth/login) should use this.
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const error = new Error("authorization token is required");
    error.statusCode = 401;
    return next(error);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = {
      userId: decoded.userId,
      hospitalId: decoded.hospitalId,
      roleId: decoded.roleId,
      roleCode: decoded.roleCode,
      username: decoded.username,
    };

    next();
  } catch (err) {
    const error = new Error("invalid or expired token");
    error.statusCode = 401;
    next(error);
  }
};

module.exports = authMiddleware;
