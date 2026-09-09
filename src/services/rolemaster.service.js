const rolemasterModel = require("../models/rolemaster.model");

const createRolemaster = async (rolemasterData) => {
  return await rolemasterModel.createRolemaster(rolemasterData);
};

const getAllRolemasters = async () => {
  return await rolemasterModel.getAllRolemasters();
}

const getRolemasterById = async (id) => {
  return await rolemasterModel.getRolemasterById(id);
}

module.exports = { createRolemaster, getAllRolemasters, getRolemasterById };
