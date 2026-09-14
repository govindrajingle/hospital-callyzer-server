const Joi = require("joi");

const createUserSchema = Joi.object({
  hospitalId: Joi.number().integer().positive().required(),

  roleId: Joi.number().integer().positive().required(),

  userName: Joi.string().trim().alphanum().min(3).max(50).required(),

  fullName: Joi.string().trim().max(200).required(),

  email: Joi.string().trim().email().max(200).allow("", null),

  password: Joi.string().min(8).max(100).required(),
});

const updateUserSchema = Joi.object({
  fullName: Joi.string().trim().max(200),

  email: Joi.string().trim().email().max(200).allow("", null),
}).min(1);

const resetPasswordSchema = Joi.object({
  newPassword: Joi.string().min(8).max(100).required(),
});

const changeOwnPasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),

  newPassword: Joi.string().min(8).max(100).required(),
});

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });

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
  validateCreateUser: validate(createUserSchema),
  validateUpdateUser: validate(updateUserSchema),
  validateResetPassword: validate(resetPasswordSchema),
  validateChangeOwnPassword: validate(changeOwnPasswordSchema),
};
