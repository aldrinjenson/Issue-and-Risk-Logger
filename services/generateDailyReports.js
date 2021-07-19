const { entities } = require("../constants");
const { SubGroup } = require("../models/SubGroup");
const { handleListRecords } = require("../utils/entityUtils");

const generateDailyReports = async (bot) => {
  const subgroups = await SubGroup.find({}).lean();
  const entityModels = Object.values(entities).map((entity) => entity.Model);

  for (const group of subgroups) {
    const { groupId, groupName } = group;
    const opts = { groupId, groupName };
    await bot.sendMessage(
      groupId,
      `Daily Report for ${new Date().toLocaleDateString()}`
    );

    for (const Model of entityModels) {
      const records = await Model.find({
        addedGroupId: groupId,
        isOpen: true,
      });
      if (records.length) {
        await bot.sendMessage(groupId, `Open ${Model.modelName}s:`);
      }
      handleListRecords(records, bot, opts, true, Model.modelName);
    }
  }
};

module.exports = { generateDailyReports };
