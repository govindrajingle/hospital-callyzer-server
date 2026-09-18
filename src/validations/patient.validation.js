const Joi = require("joi");

const REFERRAL_SOURCES = [
  "PATIENT_REFERRAL", "WEBSITE", "NEWSPAPER", "MAGAZINE",
  "RADIO", "TELEVISION", "HOARDING", "SOCIAL_MEDIA", "OTHER",
];
const MARITAL_STATUSES = ["SINGLE", "MARRIED", "DIVORCED", "WIDOWED", "OTHER"];

const namePattern = /^[a-zA-Z\s.'-]+$/;
const phonePattern = /^[0-9]{6,15}$/;
const mobilePattern = /^[0-9]{10}$/;

const nameField = (max) =>
  Joi.string().trim().max(max).pattern(namePattern).messages({
    "string.pattern.base": "must only contain letters, spaces, apostrophes, or hyphens",
  });

const optionalPhone = Joi.string().trim().pattern(phonePattern).allow("", null).messages({
  "string.pattern.base": "must be 6 to 15 digits",
});

const createPatientSchema = Joi.object({
  // Mandatory, per clinic policy: name, mobile, and full address (street/city/state).
  firstName: nameField(100).required(),
  middleName: nameField(100).allow("", null),
  lastName: nameField(100).allow("", null),

  mobile: Joi.string().trim().pattern(mobilePattern).required().messages({
    "string.pattern.base": "mobile must be exactly 10 digits",
  }),
  street: Joi.string().trim().min(2).max(255).required(),
  city: Joi.string().trim().min(2).max(100).required(),
  state: Joi.string().trim().min(2).max(100).required(),

  // Everything below is optional.
  dateOfBirth: Joi.date().iso().max("now").allow(null),
  gender: Joi.string().valid("Male", "Female", "Other").allow(null),
  email: Joi.string().trim().email().max(200).allow("", null),

  address: Joi.string().trim().max(500).allow("", null),
  locality: Joi.string().trim().max(150).allow("", null),
  landmark: Joi.string().trim().max(150).allow("", null),
  pinCode: Joi.string().trim().pattern(/^[0-9]{4,10}$/).allow("", null).messages({
    "string.pattern.base": "PIN code must be 4 to 10 digits",
  }),
  country: Joi.string().trim().max(100).allow("", null),

  telephoneResidence: optionalPhone,
  telephoneOffice: optionalPhone,
  faxNumber: optionalPhone,
  preferredContactTime: Joi.string().valid("AM", "PM").allow("", null),

  bloodGroup: Joi.string().valid("A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-").allow(null),
  occupation: Joi.string().trim().max(150).allow("", null),
  maritalStatus: Joi.string().valid(...MARITAL_STATUSES).allow("", null),

  planType: Joi.string().trim().max(150).allow("", null),
  // Explicitly NOT required — a plan/expiry may not be decided at registration time.
  planExpiresDate: Joi.date().iso().allow(null),
  ailment: Joi.string().trim().max(2000).allow("", null),

  referralSource: Joi.string().valid(...REFERRAL_SOURCES).allow("", null),
  referralPersonName: Joi.string().trim().max(200).allow("", null),
  referralPatientMrn: Joi.string().trim().max(50).allow("", null),

  // Must be explicitly TRUE to register — previously this was just
  // Joi.boolean(), which let the form submit successfully whether the
  // checkbox was ticked or not.
  consentTerms: Joi.boolean().valid(true).required().messages({
    "any.only": "the patient must agree to the Terms & Conditions before registering",
    "any.required": "the patient must agree to the Terms & Conditions before registering",
  }),
  consentMarketing: Joi.boolean().default(false),

  emergencyContactName: Joi.string().trim().max(200).allow("", null),
  emergencyContactNumber: Joi.string().trim().pattern(mobilePattern).allow("", null).messages({
    "string.pattern.base": "emergencyContactNumber must be exactly 10 digits",
  }),

  governmentIdType: Joi.string().trim().max(50).allow("", null),
  governmentIdNumber: Joi.string().trim().max(100).allow("", null),
  photoUrl: Joi.string().trim().uri().allow("", null),

  confirmDuplicate: Joi.boolean(),
});

// Same rules on edit, EXCEPT consent isn't re-demanded on every update —
// it was already captured (and can be changed explicitly) at registration.
const updatePatientSchema = createPatientSchema
  .fork(["firstName", "mobile", "street", "city", "state"], (schema) => schema.optional())
  .fork(["consentTerms"], () => Joi.boolean())
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
