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
  const rolemasters =  await rolemasterService.getAllRolemasters();
  res.status(200).json({
    success: true,
    data: rolemasters,
  })
})

const getRolemasterById = async (req, res) => {
  const rolemaster = await rolemasterService.getRolemasterById(req.params.id);
  if(!rolemaster) {
    const error = new Error("rolemaster not found");
    error.status = 404;
    throw error;
  }
  res.status(200).json({
    success: true,
    data: rolemaster,
  })
}

module.exports = {
  createRolemaster,
  getAllRolemasters,
  getRolemasterById,
};
