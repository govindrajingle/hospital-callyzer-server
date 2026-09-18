const Joi = require("joi");

const createRoleSchema = Joi.object({
  roleCode: Joi.string().uppercase().max(50).required(),
  roleName: Joi.string().max(100).required(),
  parentRoleId: Joi.number().integer().allow(null).optional(),
});

const updateRoleSchema = Joi.object({
  roleName: Joi.string().max(100),
  parentRoleId: Joi.number().integer().allow(null),
  active: Joi.boolean(),
}).min(1);

module.exports = { createRoleSchema, updateRoleSchema };
