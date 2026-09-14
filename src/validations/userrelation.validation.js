const Joi = require("joi");

const createUserRelationshipSchema = Joi.object({
  hospitalId: Joi.number().integer().positive().required(),

  seniorUserId: Joi.number().integer().positive().required(),

  juniorUserId: Joi.number().integer().positive().required(),
}).custom((value, helpers) => {
  if (value.seniorUserId === value.juniorUserId) {
    return helpers.message(
      "seniorUserId and juniorUserId cannot be the same user",
    );
  }
  return value;
});

const validateUserRelationship = (req, res, next) => {
  const { error } = createUserRelationshipSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: "validation of user relationship data failed",
      errors: error.details.map((detail) => detail.message),
    });
  }

  next();
};

module.exports = {
  validateUserRelationship,
};
