/* eslint-disable max-statements */
/* eslint-disable max-lines-per-function */
/* eslint-disable multiline-ternary */
/* eslint-disable no-ternary */
/* eslint-disable object-property-newline */
/* eslint-disable camelcase */
const { SubGroup } = require("../models/SubGroup");
const { Issue } = require("../models/Issue");
const { handleReplyFlow } = require("../utils");

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
    values.criticalDate.length >= 5 ? values.criticalDate : null;
  const newIssue = new Issue({
    addedBy: from.username,
    addedGroupId: groupId,
    addedDate: message.date,
    addedGroupName: subGroupName,
    name: values.name,
    criticalDate,
    mainGroupId,
  });
  newIssue.save().then(() => {
    bot.sendMessage(
      groupId,
      `New issue registered  as\nTitle: ${values.name}\nCritical date: ${
        criticalDate || "Nil"
      }`
    );
    bot.sendMessage(
      mainGroupId,
      `New issue registered in ${subGroupName} by @${
        from.username
      } as\nTitle: ${values.name}\nCritical date: ${criticalDate || "Nil"}`
    );
  });
};

module.exports = { addNewIssue };
