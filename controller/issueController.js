const { SubGroup } = require("../models/SubGroup");
const { Issue } = require("../models/Issue");
const { handleReplyFlow } = require("../utils/common");
const { formatIssues } = require("../utils/issueUtils");

const addNewIssue = async (data, bot) => {
  const { message, from } = data;
  const { title: subGroupName, id: groupId } = message.chat;
  const { mainGroupId } = await SubGroup.findOne({ groupId }).exec();

  if (!mainGroupId) {
    bot.sendMessage(
      groupId,
      "Cannot fetch the main group details. \nEnsure that you have properly registered the bot"
    );
    return;
  }

  const flowPrompts = [
    {
      key: "name",
      prompt: "Enter issue as a reply to this message",
    },
    {
      key: "criticalDate",
      prompt:
        "Enter critical date in string form as a reply to this message\nEnter . to skip entering date",
    },
  ];

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
  });
  newIssue
    .save()
    .then(() => {
      bot.sendMessage(
        groupId,
        `New issue registered as:\nTitle: ${values.name}\nCritical date: ${
          criticalDate || "Nil"
        }`
      );
      bot.sendMessage(
        mainGroupId,
        `New issue registered in ${subGroupName} by @${
          from.username
        } as:\nTitle: ${values.name}\nCritical date: ${criticalDate || "Nil"}`
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

const listIssues = async (data, bot) => {
  const { message } = data;
  const { id: groupId } = message.chat;
  const isSubGroup = await SubGroup.findOne({ groupId }).exec();
  const groupQuery = isSubGroup
    ? { addedGroupId: groupId }
    : { mainGroupId: groupId };
  const issuesList = await Issue.find(groupQuery).exec();
  const formattedIssuesListMessage = formatIssues(issuesList, isSubGroup);
  bot.sendMessage(
    groupId,
    formattedIssuesListMessage.length
      ? formattedIssuesListMessage
      : "No issue have been registered"
  );
};

module.exports = { addNewIssue, listIssues };
