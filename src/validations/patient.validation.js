const Joi = require("joi");

const REFERRAL_SOURCES = [
  "PATIENT_REFERRAL",
  "WEBSITE",
  "NEWSPAPER",
  "MAGAZINE",
  "RADIO",
  "TELEVISION",
  "HOARDING",
  "SOCIAL_MEDIA",
  "OTHER",
];

const MARITAL_STATUSES = ["SINGLE", "MARRIED", "DIVORCED", "WIDOWED", "OTHER"];

const phonePattern = Joi.string().trim().pattern(/^[0-9]{6,15}$/).messages({
  "string.pattern.base": "must be 6 to 15 digits",
});

const createPatientSchema = Joi.object({
  firstName: Joi.string().trim().max(100).required(),
  lastName: Joi.string().trim().max(100).allow("", null),

  dateOfBirth: Joi.date().iso().max("now").allow(null),
  gender: Joi.string().valid("Male", "Female", "Other").allow(null),

  mobile: Joi.string().trim().pattern(/^[0-9]{10}$/).required().messages({
    "string.pattern.base": "mobile must be exactly 10 digits",
  }),
  email: Joi.string().trim().email().allow("", null),

  address: Joi.string().trim().allow("", null),
  street: Joi.string().trim().max(255).allow("", null),
  locality: Joi.string().trim().max(150).allow("", null),
  landmark: Joi.string().trim().max(150).allow("", null),
  city: Joi.string().trim().max(100).allow("", null),
  state: Joi.string().trim().max(100).allow("", null),
  pinCode: Joi.string().trim().max(20).allow("", null),
  country: Joi.string().trim().max(100).allow("", null),

  telephoneResidence: phonePattern.allow("", null),
  telephoneOffice: phonePattern.allow("", null),
  faxNumber: phonePattern.allow("", null),

  bloodGroup: Joi.string().valid("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-").allow(null),

  occupation: Joi.string().trim().max(150).allow("", null),
  maritalStatus: Joi.string().valid(...MARITAL_STATUSES).allow("", null),

  planType: Joi.string().trim().max(150).allow("", null),
  planExpiresDate: Joi.date().iso().allow(null),
  ailment: Joi.string().trim().max(2000).allow("", null),

  referralSource: Joi.string().valid(...REFERRAL_SOURCES).allow("", null),
  referralPersonName: Joi.string().trim().max(200).allow("", null),

  consentTerms: Joi.boolean(),
  consentMarketing: Joi.boolean(),

  emergencyContactName: Joi.string().trim().max(200).allow("", null),
  emergencyContactNumber: Joi.string().trim().pattern(/^[0-9]{10}$/).allow("", null).messages({
    "string.pattern.base": "emergencyContactNumber must be exactly 10 digits",
  }),

  governmentIdType: Joi.string().trim().max(50).allow("", null),
  governmentIdNumber: Joi.string().trim().max(100).allow("", null),
  photoUrl: Joi.string().trim().uri().allow("", null),

  // Set to true only after the frontend has shown the user a duplicate
  // warning and they explicitly chose to proceed anyway.
  confirmDuplicate: Joi.boolean(),
});

const updatePatientSchema = createPatientSchema
  .fork(["firstName", "mobile"], (schema) => schema.optional())
  .min(1);

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
  REFERRAL_SOURCES,
  MARITAL_STATUSES,
};
