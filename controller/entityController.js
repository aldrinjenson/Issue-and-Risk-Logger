const { SubGroup } = require("../models/SubGroup");
const { Issue } = require("../models/Issue");
const { handleReplyFlow, handleButtons } = require("../utils/common");
const {
  handleIssueUpdate,
  getIssueIdFromSubGroupCode,
  handleGroupFilter,
  handleListIssues,
} = require("../utils/issueUtils");

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
      prompt: `Chose Assignee\nEnter username in the format: @username as a reply to this message\nEnter . to skip adding assignee`,
      condition: (userName) =>
        userName === "." || (userName[0] === "@" && userName.length > 3),
    },
  ];

  // const impactButtons = [
  //   {
  //     text: `High`,
  //     onPress: (data, bot) => handleIssueUpdate(issue._id, data, bot),
  //   },
  // ];

  const issueCode = await getIssueIdFromSubGroupCode(groupId, groupCode);
  const values = await handleReplyFlow(flowPrompts, message, bot);
  console.log({ values });
  const { assignee, criticalDate } = values;

  const newIssue = new Issue({
    addedBy: from.username,
    addedGroupId: groupId,
    addedDate: message.date,
    addedGroupName: subGroupName,
    name: values.name,
    assignee: assignee || null,
    criticalDate: criticalDate || null,
    mainGroupId,
    isOpen: true,
    issueCode,
  });

  newIssue
    .save()
    .then((r) => {
      console.log(r);
      bot.sendMessage(
        groupId,
        `New issue registered as:\nTitle: ${values.name}\nCritical date: ${
          criticalDate || "Nil"
        }\nIssueCode: ${issueCode}\nAssigned to: ${assignee}`
      );
      bot.sendMessage(
        mainGroupId,
        `New issue registered in ${subGroupName} by @${
          from.username
        } as:\nTitle: ${values.name}\nCritical date: ${
          criticalDate || "Nil"
        }\nIssue Code: ${issueCode}\nAssigned to: ${assignee}`
      );
    })
    .catch((err) => {
      console.log("error in saving" + err);
      bot.sendMessage(
        groupId,
        "Error in saving issue. Ensure you have entered values correctly and try again"
      );
    });
};

const listRecords = async ({ message }, bot) => {
  const { id: groupId } = message.chat;
  const isSubGroup = await SubGroup.findOne({ groupId }).exec();
  const groupQuery = isSubGroup
    ? { addedGroupId: groupId }
    : { mainGroupId: groupId };

  const issuesList = await Issue.find({ ...groupQuery, isOpen: true })
    .sort("issueCode")
    .exec();
  handleListIssues(issuesList, bot, message, isSubGroup);
};

// only for main groups
const listFilteredRecords = async ({ message }, bot) => {
  const { id: groupId } = message.chat;

  const subGroupsUnderThisMainGroup = await SubGroup.find({
    mainGroupId: groupId,
  })
    .sort("groupCode")
    .exec();

  const buttons = subGroupsUnderThisMainGroup.map((grp) => ({
    text: `${grp.groupCode} - ${grp.groupName}`,
    onPress: async (data, bot) =>
      await handleGroupFilter(grp.groupId, data, bot),
  }));

  const keyboardOptions = handleButtons(buttons);
  bot.sendMessage(groupId, "Choose group to display issues: ", keyboardOptions);
};

const updateRecords = async ({ message }, bot) => {
  const { id: groupId } = message.chat;
  const issuesList = await Issue.find({
    addedGroupId: groupId,
    isOpen: true,
  }).exec();

  const buttons = issuesList.map((issue, index) => ({
    text: `${index + 1}. ${issue.name}`,
    onPress: (data, bot) => handleIssueUpdate(issue._id, data, bot),
  }));

  const keyboardOptions = handleButtons(buttons);
  bot.sendMessage(groupId, "Choose issue to update: ", keyboardOptions);
};

module.exports = {
  addNewEntity,
  listRecords,
  updateRecords,
  listFilteredRecords,
};
