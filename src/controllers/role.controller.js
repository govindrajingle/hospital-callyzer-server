const roleModel = require("../models/role.model");
const { createRoleSchema, updateRoleSchema } = require("../validations/role.validation");
const ApiError = require("../utils/ApiError");

async function list(req, res, next) {
  try {
    const rows = await roleModel.listAll();
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { error, value } = createRoleSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);
    const existing = await roleModel.findByCode(value.roleCode);
    if (existing) throw new ApiError(409, "A role with this code already exists.");
    const role = await roleModel.createRole(value);
    res.status(201).json({ success: true, data: role });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { error, value } = updateRoleSchema.validate(req.body);
    if (error) throw new ApiError(400, error.details[0].message);
    const existing = await roleModel.findById(req.params.id);
    if (!existing) throw new ApiError(404, "Role not found.");
    const fields = {};
    if (value.roleName !== undefined) fields.role_name = value.roleName;
    if (value.parentRoleId !== undefined) fields.parent_role_id = value.parentRoleId;
    if (value.active !== undefined) fields.active = value.active;
    const role = await roleModel.updateRole(req.params.id, fields);
    res.json({ success: true, data: role });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update };
