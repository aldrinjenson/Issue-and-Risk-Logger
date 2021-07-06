const { impactButtons } = require("../constants");
const { SubGroup } = require("../models/SubGroup");
const {
  handleReplyFlow,
  handleButtons,
  getButtonChooserValue,
} = require("../utils/common");
const {
  handleRecordUpdate,
  getRecordId,
  handleGroupFilter,
  handleListRecords,
} = require("../utils/entityUtils");

const addNewEntity = async (data, bot, entity) => {
  const { message, from } = data;
  const { title: subGroupName, id: groupId } = message.chat;
  const CurrentSubGroup = await SubGroup.findOne({ groupId }).exec();

  if (!CurrentSubGroup) {
    bot.sendMessage(
      groupId,
      "Cannot fetch the main group details. \nEnsure that you have properly registered the bot"
    );
    return;
  }
  const { mainGroupId, groupCode } = CurrentSubGroup;
  const flowPrompts = [
    {
      key: "name",
      prompt: `Enter ${entity.name} name as a reply to this message`,
      condition: (name) => name.length >= 4,
    },
    {
      key: "criticalDate",
      prompt:
        "Enter critical date in string form as a reply to this message\nEnter . to skip entering date",
      condition: (date) => date === "." || date.length > 3,
    },
    {
      key: "assignee",
      prompt: `Choose Assignee\nEnter username in the format: @username as a reply to this message\nEnter . to skip adding assignee`,
      condition: (userName) =>
        userName === "." ||
        (userName[0] === "@" && userName.split(" ").length === 3),
    },
  ];

  const recordId = await getRecordId(groupId, groupCode, entity);
  const values = await handleReplyFlow(flowPrompts, message, bot);
  let { assignee, criticalDate } = values;
  assignee = assignee === "." ? null : assignee;
  criticalDate = criticalDate === "." ? null : criticalDate;
  const impact = await getButtonChooserValue(
    groupId,
    impactButtons,
    `Choose impact/severity of ${entity.name}: `,
    bot
  );

  const newRecord = new entity.Model({
    name: values.name,
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

  // const stri

  newRecord
    .save()
    .then(() => {
      bot.sendMessage(
        groupId,
        `New ${entity.name} registered as:\nTitle: ${values.name}\n${
          entity.name
        } ID: ${recordId}\nAssigned to: ${assignee || "Nil"}\nCritical date: ${
          criticalDate || "Nil"
        }\nImpact: ${impact}`
      );
      if (entity.shouldShowInMainGroup) {
        bot.sendMessage(
          mainGroupId,
          `New ${entity.label} registered in "${subGroupName}" by @${
            from.username
          } as:\nName: ${values.name}\n${
            entity.name
          } ID: ${recordId}\nAssigned to: ${
            assignee || "Nil"
          }\nCritical date: ${criticalDate || "Nil"}\nImpact: ${impact}`
        );
      }
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
    onPress: async (data, bot) =>
      await handleGroupFilter(grp.groupId, data, bot, entity),
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

  const buttons = recordsList.map((record) => ({
    text: `${record.recordId}: ${record.name}`,
    onPress: (data, bot) => handleRecordUpdate(record._id, data, bot, entity),
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
