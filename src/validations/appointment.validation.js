const Joi = require("joi");

const PAYMENT_MODES = ["cash", "upi", "card", "other"];
const STATUSES = ["scheduled", "completed", "cancelled", "no_show"];

const createAppointmentSchema = Joi.object({
  patientId: Joi.number().integer().required(),
  doctorId: Joi.number().integer().required(),
  receiverId: Joi.number().integer().allow(null),
  receiverName: Joi.string().trim().max(200).allow("", null),
  slotStart: Joi.date().iso().required(),
  slotEnd: Joi.date().iso().greater(Joi.ref("slotStart")).allow(null),
  type: Joi.string().trim().max(100).required(),
  // If the typed category doesn't already exist for this hospital, the
  // client must resend with this set to true after the user confirms —
  // otherwise the request is rejected with NEW_TYPE_CONFIRMATION_REQUIRED.
  confirmNewType: Joi.boolean().default(false),
  fees: Joi.number().min(0).precision(2).required(),
  paymentMode: Joi.string().valid(...PAYMENT_MODES).required(),
});

const updateAppointmentSchema = Joi.object({
  doctorId: Joi.number().integer(),
  receiverId: Joi.number().integer().allow(null),
  receiverName: Joi.string().trim().max(200).allow("", null),
  slotStart: Joi.date().iso(),
  slotEnd: Joi.date().iso().allow(null),
  type: Joi.string().trim().max(100),
  confirmNewType: Joi.boolean().default(false),
  fees: Joi.number().min(0).precision(2),
  paymentMode: Joi.string().valid(...PAYMENT_MODES),
  status: Joi.string().valid(...STATUSES),
}).min(1);

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      message: "validation failed",
      errors: error.details.map((detail) => detail.message),
    });
  }
  req.body = value;
  next();
};

module.exports = {
  validateCreateAppointment: validate(createAppointmentSchema),
  validateUpdateAppointment: validate(updateAppointmentSchema),
  PAYMENT_MODES,
  STATUSES,
};
