const Joi = require("joi");

const createRolemasterSchema = Joi.object({
  roleName: Joi.string().trim().max(50).required(),
  roleCode: Joi.string().trim().max(20).required(),
  parentRoleId: Joi.string().trim().max(10).required(),
});

const validateCreateRolemaster = (req, res, next) => {
  const { error } = createRolemasterSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: "validation failed",
      errors: error.details.map((detail) => detail.message),
    });
  }

  next();
};

module.exports = {
  validateCreateRolemaster,
};
