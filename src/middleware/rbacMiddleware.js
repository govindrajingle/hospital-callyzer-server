// Restricts a route to specific role codes, e.g.:
//   router.post("/", authMiddleware, requireRole("HOSPITAL_ADMIN", "MANAGER"), controller.create)
//
// Must run AFTER authMiddleware, since it reads req.user.roleCode which
// authMiddleware is responsible for setting.
const requireRole = (...allowedRoleCodes) => {
  return (req, res, next) => {
    if (!req.user) {
      const error = new Error(
        "requireRole middleware used without authMiddleware running first",
      );
      error.statusCode = 500;
      return next(error);
    }

    if (!allowedRoleCodes.includes(req.user.roleCode)) {
      const error = new Error(
        "you do not have permission to perform this action",
      );
      error.statusCode = 403;
      return next(error);
    }

    next();
  };
};

module.exports = { requireRole };
