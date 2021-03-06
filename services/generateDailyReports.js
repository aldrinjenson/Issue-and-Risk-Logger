const { SubGroup } = require("../models");
const { entities } = require("../constants");
const { handleListRecords } = require("../utils/entityUtils");

const sendReport = async (bot, opts, entityModels) => {
  const { groupId } = opts;
  await bot.sendMessage(
    groupId,
    `Daily Report for ${new Date().toLocaleDateString("en-IN")}`
  );

  for (const Model of entityModels) {
    const records = await Model.find({
      addedGroupId: groupId,
      isOpen: true,
    })
      .lean()
      .sort("createdAt")
      .exec();

    if (records.length) {
      await bot.sendMessage(groupId, `Open ${Model.modelName}s:`);
    }
    await handleListRecords(records, bot, opts, true, Model.modelName);
  }
};

const generateDailyReports = async (bot) => {
  const subgroups = await SubGroup.find({}).lean();
  const entityModels = Object.values(entities).map((entity) => entity.Model);
  // taking all issues, risks and actions

  const promises = [];
  for (const group of subgroups) {
    const opts = { groupId: group.groupId, groupName: group.groupName };
    promises.push(sendReport(bot, opts, entityModels));
  }
  await Promise.all(promises); // executing all promises parallely
};

module.exports = { generateDailyReports };
