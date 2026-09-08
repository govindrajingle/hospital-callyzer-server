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

module.exports = {
  createRolemaster,
};
