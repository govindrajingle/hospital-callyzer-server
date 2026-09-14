const rolemasterModel = require("../models/rolemaster.model");

const createRolemaster = async (rolemasterData) => {
  return await rolemasterModel.createRolemaster(rolemasterData);
};

const getAllRolemasters = async () => {
  return await rolemasterModel.getAllRolemasters();
};

const getRolemasterById = async (id) => {
  return await rolemasterModel.getRolemasterById(id);
};

// Merges only the fields the client actually sent on top of the existing
// row, so a partial update (e.g. just { roleName }) never accidentally
// wipes out parentRoleId or roleCode.
const updateRolemaster = async (id, updates) => {
  const existing = await rolemasterModel.getRolemasterById(id);

  if (!existing) {
    return null;
  }

  const merged = {
    roleName:
      updates.roleName !== undefined ? updates.roleName : existing.role_name,
    roleCode:
      updates.roleCode !== undefined ? updates.roleCode : existing.role_code,
    parentRoleId:
      updates.parentRoleId !== undefined
        ? updates.parentRoleId
        : existing.parent_role_id,
  };

  return await rolemasterModel.updateRolemaster(id, merged);
};

module.exports = {
  createRolemaster,
  getAllRolemasters,
  getRolemasterById,
  updateRolemaster,
};
