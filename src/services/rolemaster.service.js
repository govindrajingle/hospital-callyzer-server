const rolemasterModel = require("../models/rolemaster.model");

const createRolemaster = async (rolemasterData) => {
  return await rolemasterModel.createRolemaster(rolemasterData);
};

module.exports = { createRolemaster };
