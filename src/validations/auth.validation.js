const Joi = require("joi");

const loginSchema = Joi.object({
  username: Joi.string().trim().required(),
  password: Joi.string().required(),
});

const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      success: false,
      message: "validation of login data failed",
      errors: error.details.map((detail) => detail.message),
    });
  }

  next();
};

module.exports = {
  validateLogin,
};
