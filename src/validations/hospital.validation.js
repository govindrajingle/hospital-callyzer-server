const Joi = require("joi");

const createHospitalSchema = Joi.object({
  hospitalName: Joi.string().trim().max(200).required(),

  hospitalCode: Joi.string().trim().uppercase().max(50).required(),

  address: Joi.string().trim().allow("", null),

  city: Joi.string().trim().max(100).allow("", null),

  state: Joi.string().trim().max(100).allow("", null),
});

const updateHospitalSchema = Joi.object({
  hospitalName: Joi.string().trim().max(200),

  hospitalCode: Joi.string().trim().uppercase().max(50),

  address: Joi.string().trim().allow("", null),

  city: Joi.string().trim().max(100).allow("", null),

  state: Joi.string().trim().max(100).allow("", null),
}).min(1);

const validateCreateHospital = (req, res, next) => {
  const { error } = createHospitalSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: "validation of create hospital data failed",
      errors: error.details.map((detail) => detail.message),
    });
  }

  next();
};

const validateUpdateHospital = (req, res, next) => {
  const { error } = updateHospitalSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: "validation of update hospital data failed",
      errors: error.details.map((detail) => detail.message),
    });
  }

  next();
};

module.exports = {
  validateCreateHospital,
  validateUpdateHospital,
};
