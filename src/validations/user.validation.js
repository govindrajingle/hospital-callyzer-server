const Joi = require("joi");

const createUserSchema = Joi.object({
  hospitalId: Joi.string().trim().required(),
  roleId: Joi.string().trim().required(),
  userName: Joi.string().trim().max(50).required(),
  fullName: Joi.string().trim().max(100).required(),
  email: Joi.string().trim().max(100).required(),
});

const validateCreateUser = (req, res, next) => {
  const { error } = createUserSchema.validate(req.body, { abortEarly: false });

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
  validateCreateUser,
};
