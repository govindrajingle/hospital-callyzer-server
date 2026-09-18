const Joi = require("joi");

const PAYMENT_MODES = ["cash", "upi", "card", "other"];
const STATUSES = ["scheduled", "completed", "cancelled", "no_show"];

const createAppointmentSchema = Joi.object({
  patientId: Joi.number().integer().required(),
  doctorId: Joi.number().integer().required(),
  receiverId: Joi.number().integer().allow(null),
  receiverName: Joi.string().trim().max(200).allow("", null),
  // Booking is future-only — a receptionist can't create an appointment in
  // a slot that has already passed. (Editing/updating an EXISTING
  // appointment, including marking a past one completed/cancelled/no-show,
  // is a different action and isn't restricted this way — see
  // updateAppointmentSchema below.)
  slotStart: Joi.date().iso().greater("now").required().messages({
    "date.greater": "appointments can only be booked for a future date and time",
  }),
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
  // Deliberately NOT future-restricted like createAppointmentSchema —
  // admin needs to be able to edit/re-save an appointment (e.g. mark it
  // completed or no-show) after its slot time has already passed.
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
