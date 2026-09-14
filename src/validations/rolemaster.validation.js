const Joi = require("joi");

const createRolemasterSchema = Joi.object({
  roleName: Joi.string().trim().max(100).required(),

  roleCode: Joi.string().trim().uppercase().max(50).required(),

  // Nullable on purpose — a top-level role (e.g. "Hospital Admin") has no
  // parent. Making this required, as it was before, made it impossible to
  // ever create a top-level role.
  parentRoleId: Joi.number().integer().positive().allow(null).optional(),
});

const updateRolemasterSchema = Joi.object({
  roleName: Joi.string().trim().max(100),

  roleCode: Joi.string().trim().uppercase().max(50),

  parentRoleId: Joi.number().integer().positive().allow(null),
}).min(1);

const validateCreateRolemaster = (req, res, next) => {
  const { error } = createRolemasterSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: "validation of create role data failed",
      errors: error.details.map((detail) => detail.message),
    });
  }

  next();
};

const validateUpdateRolemaster = (req, res, next) => {
  const { error } = updateRolemasterSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: "validation of update role data failed",
      errors: error.details.map((detail) => detail.message),
    });
  }

  next();
};

module.exports = {
  validateCreateRolemaster,
  validateUpdateRolemaster,
};
