const { allPromptFields } = require("../constants");
const { SubGroup } = require("../models/SubGroup");
const { handleReplyFlow, handleButtons } = require("../utils/common");
const {
  handleRecordUpdate,
  makeRecordId,
  handleGroupFilter,
  handleListRecords,
} = require("../utils/entityUtils");
const { sendEntityAddSuccessMsg } = require("../utils/messageUtils");

const addNewEntity = async (data, bot, entity) => {
  const { message, from } = data;
  const { title: subGroupName, id: groupId } = message.chat;
  const CurrentSubGroup = await SubGroup.findOne({ groupId }).exec();

  // Checking if subgroup is paired up
  if (!CurrentSubGroup) {
    bot.sendMessage(
      groupId,
      "Cannot fetch the main group details. \nEnsure that you have properly registered the bot"
    );
    return;
  }
  const { mainGroupId, groupCode } = CurrentSubGroup;
  const recordId = await makeRecordId(groupId, groupCode, entity);

  // get all the entity fields which are to be collected from the user
  const fieldsTobeCollectedFromuser = entity.fieldsCollected.map((field) =>
    allPromptFields(entity, field)
  );

  const { name, assignee, criticalDate, impact } = await handleReplyFlow(
    fieldsTobeCollectedFromuser,
    groupId,
    bot
  );

  const newRecord = new entity.Model({
    name,
    type: entity.name,
    addedBy: from.username,
    addedGroupId: groupId,
    addedDate: message.date,
    addedGroupName: subGroupName,
    assignee: assignee,
    criticalDate: criticalDate,
    mainGroupId,
    isOpen: true,
    recordId,
    impact,
  });

  newRecord
    .save()
    .then((savedRec) => {
      sendEntityAddSuccessMsg(groupId, bot, savedRec, entity);
    })
    .catch((err) => {
      console.log("error in saving" + err);
      bot.sendMessage(
        groupId,
        `Error in saving ${entity.name}. Ensure you have entered values correctly and try again`
      );
    });
};

const listRecords = async ({ message }, bot, entity) => {
  const { id: groupId } = message.chat;
  const isSubGroup = await SubGroup.findOne({ groupId }).exec();
  const groupQuery = isSubGroup
    ? { addedGroupId: groupId }
    : { mainGroupId: groupId };

  const recordsList = await entity.Model.find({ ...groupQuery, isOpen: true })
    .sort("createdAt")
    .exec();
  handleListRecords(recordsList, bot, message, isSubGroup, entity);
};

// only for main groups
const listFilteredRecords = async ({ message }, bot, entity) => {
  const { id: groupId } = message.chat;

  const subGroupsUnderThisMainGroup = await SubGroup.find({
    mainGroupId: groupId,
  })
    .sort("groupCode")
    .exec();

  const buttons = subGroupsUnderThisMainGroup.map((grp) => ({
    text: `${grp.groupCode} - ${grp.groupName}`,
    onPress: (data, bot) => handleGroupFilter(grp.groupId, data, bot, entity),
  }));

  const keyboardOptions = handleButtons(buttons);
  bot.sendMessage(
    groupId,
    `Choose group to display ${entity.name}s: `,
    keyboardOptions
  );
};

const updateRecords = async ({ message }, bot, entity) => {
  const { id: groupId } = message.chat;
  const recordsList = await entity.Model.find({
    addedGroupId: groupId,
    isOpen: true,
  }).exec();

  if (!recordsList.length) {
    bot.sendMessage(groupId, `No open ${entity.name} to update`);
    return;
  }

  const buttons = recordsList.map((record) => ({
    text: `${record.recordId}: ${record.name}`,
    onPress: (data, bot) => handleRecordUpdate(record, data, bot, entity),
  }));

  const keyboardOptions = handleButtons(buttons);
  bot.sendMessage(
    groupId,
    `Choose ${entity.name} to update: `,
    keyboardOptions
  );
};

module.exports = {
  addNewEntity,
  listRecords,
  updateRecords,
  listFilteredRecords,
};
