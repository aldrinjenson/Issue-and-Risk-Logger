const { SubGroup } = require("../models/SubGroup");
const { Issue } = require("../models/Issue");
const { handleReplyFlow, handleButtons } = require("../utils/common");
const {
  formatIssuesList,
  handleIssueUpdate,
  getIssueIdFromSubGroupCode,
} = require("../utils/issueUtils");

const addNewIssue = async (data, bot) => {
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
      prompt: "Enter issue name as a reply to this message",
    },
    {
      key: "criticalDate",
      prompt:
        "Enter critical date in string form as a reply to this message\nEnter . to skip entering date",
    },
  ];

  const issueCode = await getIssueIdFromSubGroupCode(groupId, groupCode);
  const values = await handleReplyFlow(flowPrompts, message, bot);
  const criticalDate =
    values.criticalDate.length > 3 ? values.criticalDate : null;

  const newIssue = new Issue({
    addedBy: from.username,
    addedGroupId: groupId,
    addedDate: message.date,
    addedGroupName: subGroupName,
    name: values.name,
    criticalDate,
    mainGroupId,
    isOpen: true,
    issueCode,
  });

  newIssue
    .save()
    .then(() => {
      bot.sendMessage(
        groupId,
        `New issue registered as:\nTitle: ${values.name}\nCritical date: ${
          criticalDate || "Nil"
        }\nIssueCode: ${issueCode}`
      );
      bot.sendMessage(
        mainGroupId,
        `New issue registered in ${subGroupName} by @${
          from.username
        } as:\nTitle: ${values.name}\nCritical date: ${
          criticalDate || "Nil"
        }\nIssue Code: ${issueCode}`
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

const listIssues = async ({ message }, bot) => {
  const { id: groupId } = message.chat;
  const isSubGroup = await SubGroup.findOne({ groupId }).exec();
  const groupQuery = isSubGroup
    ? { addedGroupId: groupId }
    : { mainGroupId: groupId };

  // list only open issues
  const issuesList = await Issue.find({ ...groupQuery, isOpen: true }).exec();
  const formattedIssuesListMessage = formatIssuesList(issuesList, isSubGroup);
  bot.sendMessage(
    groupId,
    formattedIssuesListMessage.length
      ? formattedIssuesListMessage
      : "No issues have been registered"
  );
};

const updateIssue = async ({ message }, bot) => {
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

module.exports = { addNewIssue, listIssues, updateIssue };
