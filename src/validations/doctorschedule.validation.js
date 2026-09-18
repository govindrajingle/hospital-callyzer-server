const Joi = require("joi");

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const timeField = () => Joi.string().trim().pattern(TIME_PATTERN).messages({
  "string.pattern.base": "must be a 24-hour HH:MM time",
});

const updateScheduleSchema = Joi.object({
  startTime: timeField().required(),
  endTime: timeField().required(),
  // Both break fields must be given together, or both left out entirely —
  // a "break" with only one end doesn't mean anything.
  breakStartTime: timeField().allow("", null),
  breakEndTime: timeField().allow("", null),
})
  // All cross-field checks live in one object-level custom() — a per-key
  // custom() can't reliably see a sibling key's value since Joi doesn't
  // guarantee key validation order.
  .custom((value, helpers) => {
    if (value.endTime <= value.startTime) {
      return helpers.error("any.custom", { message: "endTime must be after startTime" });
    }

    const hasStart = Boolean(value.breakStartTime);
    const hasEnd = Boolean(value.breakEndTime);

    if (hasStart !== hasEnd) {
      return helpers.error("any.custom", { message: "breakStartTime and breakEndTime must both be set, or both left blank" });
    }
    if (hasStart && value.breakEndTime <= value.breakStartTime) {
      return helpers.error("any.custom", { message: "breakEndTime must be after breakStartTime" });
    }
    if (hasStart && (value.breakStartTime < value.startTime || value.breakEndTime > value.endTime)) {
      return helpers.error("any.custom", { message: "the break must fall within the working hours" });
    }
    return value;
  })
  .messages({ "any.custom": "{{#message}}" });

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
  validateUpdateSchedule: validate(updateScheduleSchema),
};
