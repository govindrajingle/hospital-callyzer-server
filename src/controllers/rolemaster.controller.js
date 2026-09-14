const asyncHandler = require("../middleware/asyncHandler");
const rolemasterService = require("../services/rolemaster.service");

const createRolemaster = asyncHandler(async (req, res) => {
  const rolemaster = await rolemasterService.createRolemaster(req.body);

  res.status(201).json({
    success: true,
    message: "new role created successfully",
    data: rolemaster,
  });
});

const getAllRolemasters = asyncHandler(async (req, res) => {
  const rolemasters = await rolemasterService.getAllRolemasters();

  res.status(200).json({
    success: true,
    data: rolemasters,
  });
});

const getRolemasterById = asyncHandler(async (req, res) => {
  const rolemaster = await rolemasterService.getRolemasterById(req.params.id);

  if (!rolemaster) {
    const error = new Error("role not found");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    data: rolemaster,
  });
});

const updateRolemaster = asyncHandler(async (req, res) => {
  const rolemaster = await rolemasterService.updateRolemaster(
    req.params.id,
    req.body,
  );

  if (!rolemaster) {
    const error = new Error("role not found");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    message: "role updated successfully",
    data: rolemaster,
  });
});

module.exports = {
  createRolemaster,
  getAllRolemasters,
  getRolemasterById,
  updateRolemaster,
};
