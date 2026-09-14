const Joi = require("joi");

const createPatientSchema = Joi.object({
  firstName: Joi.string().trim().max(100).required(),

  lastName: Joi.string().trim().max(100).allow("", null),

  dateOfBirth: Joi.date().iso().max("now").allow(null),

  gender: Joi.string().valid("Male", "Female", "Other").allow(null),

  mobile: Joi.string()
    .trim()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      "string.pattern.base": "mobile must be exactly 10 digits",
    }),

  email: Joi.string().trim().email().allow("", null),

  address: Joi.string().trim().allow("", null),

  city: Joi.string().trim().max(100).allow("", null),

  state: Joi.string().trim().max(100).allow("", null),

  bloodGroup: Joi.string()
    .valid("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-")
    .allow(null),

  emergencyContactName: Joi.string().trim().max(200).allow("", null),

  emergencyContactNumber: Joi.string()
    .trim()
    .pattern(/^[0-9]{10}$/)
    .allow("", null)
    .messages({
      "string.pattern.base": "emergencyContactNumber must be exactly 10 digits",
    }),

  governmentIdType: Joi.string().trim().max(50).allow("", null),

  governmentIdNumber: Joi.string().trim().max(100).allow("", null),

  photoUrl: Joi.string().trim().uri().allow("", null),

  // Set to true only after the frontend has shown the user a duplicate
  // warning (from POST /api/patients or GET /check-duplicate) and they
  // explicitly chose to proceed anyway.
  confirmDuplicate: Joi.boolean(),
});

const updatePatientSchema = Joi.object({
  firstName: Joi.string().trim().max(100),
  lastName: Joi.string().trim().max(100).allow("", null),
  dateOfBirth: Joi.date().iso().max("now").allow(null),
  gender: Joi.string().valid("Male", "Female", "Other").allow(null),
  mobile: Joi.string()
    .trim()
    .pattern(/^[0-9]{10}$/)
    .messages({ "string.pattern.base": "mobile must be exactly 10 digits" }),
  email: Joi.string().trim().email().allow("", null),
  address: Joi.string().trim().allow("", null),
  city: Joi.string().trim().max(100).allow("", null),
  state: Joi.string().trim().max(100).allow("", null),
  bloodGroup: Joi.string()
    .valid("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-")
    .allow(null),
  emergencyContactName: Joi.string().trim().max(200).allow("", null),
  emergencyContactNumber: Joi.string()
    .trim()
    .pattern(/^[0-9]{10}$/)
    .allow("", null),
  governmentIdType: Joi.string().trim().max(50).allow("", null),
  governmentIdNumber: Joi.string().trim().max(100).allow("", null),
  photoUrl: Joi.string().trim().uri().allow("", null),
}).min(1);

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
  validateCreatePatient: validate(createPatientSchema),
  validateUpdatePatient: validate(updatePatientSchema),
};
