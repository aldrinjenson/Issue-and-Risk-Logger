const { MainGroup } = require("../models/MainGroup");

const AlreadyRegisteredGroup = async (groupId = "") => {
  const grp = await MainGroup.findOne({ groupId }).exec();
  return grp;
};

module.exports = { AlreadyRegisteredGroup };
