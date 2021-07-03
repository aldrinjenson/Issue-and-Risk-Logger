const { Issue } = require("../models/Issue");
const { handleButtons, handleReplyMessage } = require("./common");

const formatIssuesList = (issuesList = [], isSubGroup) => {
  let msg = "";
  issuesList.forEach((issue, index) => {
    const status = issue.isOpen ? "Open" : "Closed";
    msg += `${index + 1}. ${issue.name}\n    IssueId: ${
      issue.issueCode
    }\n    Critical Date: ${issue.criticalDate || "nil"}\n    Added by @${
      issue.addedBy
    }\n    Status: ${status}\n`;
    // adding 4 spaces before each new line for nice formatting :)
    if (!isSubGroup) {
      msg += `    Group: ${issue.addedGroupName}\n`;
    }
    msg += "\n";
  });
  return msg;
};

const getIssueIdFromSubGroupCode = async (groupId, groupCode) => {
  let count = await Issue.countDocuments({ addedGroupId: groupId }).exec();
  if (count < 0) {
    count = "0" + count;
  }
  return groupCode + "-" + count;
};

const transformStatusToBooelan = (val = "") => {
  // return the isOpenStatus
  const isDoneSynonyms = [
    "done",
    "completed",
    "finished",
    "closed",
    "close",
    "complete",
  ];
  const isOpenSynonyms = ["open", "incomplete", "incompleted", "remains"];

  if (isOpenSynonyms.includes(val.toLowerCase())) {
    return true;
  } else if (isDoneSynonyms.includes(val.toLowerCase())) {
    return false;
  } else {
    return -1;
  }
};

const handleUpdateField = (key, label, { issueId, groupId, bot }) => {
  const handleError = (err = "") => {
    console.log("error" + err);
    bot.sendMessage(
      groupId,
      "Error in updating. Ensure you have entered fields correctly and try again"
    );
  };

  // function for updating db
  const onFieldUpdate = (msg, bot) => {
    const val =
      key === "isOpen" ? transformStatusToBooelan(msg.text) : msg.text;
    if (val === -1) {
      handleError("Wrong input");
      return;
    }
    Issue.findOne({ _id: issueId }, (err, issue) => {
      if (err) {
        handleError(err);
        return;
      }
      if (issue[key] === val) {
        bot.sendMessage(groupId, `${label} is already same`);
        return;
      }
      issue[key] = val;
      issue.save().then(() => {
        const status = issue.isOpen ? "Open" : "Closed";
        const updateSuccessReply = `${issue.name}\nIssue Code: ${issue.issueCode}\nCritical Date: ${issue.criticalDate}\nStatus: ${status} `;
        bot.sendMessage(
          groupId,
          `${label} has been updated successfully\n\nUpdated issue:\n${updateSuccessReply}`
        );
        bot.sendMessage(
          issue.mainGroupId,
          `${label} has been updated for "${issue.name}" in "${issue.addedGroupName}" by @${msg.from.username}\n\nUpdated issue: ${updateSuccessReply}`
        );
      }); // end of save
    });
  };

  bot
    .sendMessage(
      groupId,
      `Enter new value for ${label} as a reply to this message`
    )
    .then((sentMsg) => {
      handleReplyMessage(sentMsg.message_id, onFieldUpdate);
    });
};

const handleIssueUpdate = (issueId, { message: { chat, message_id } }, bot) => {
  const { id: groupId } = chat;
  const opts = {
    issueId,
    groupId,
    message_id,
    bot,
  };
  const updateButtons = [
    { text: "Name", onPress: () => handleUpdateField("name", "Name", opts) },
    {
      text: "Critical Date",
      onPress: () => handleUpdateField("criticalDate", "Critical Date", opts),
    },
    {
      text: "Status",
      onPress: () => handleUpdateField("isOpen", "Status", opts),
    },
  ];
  const keyboardOptions = handleButtons(updateButtons);
  bot.sendMessage(groupId, "Choose field to update: ", keyboardOptions);
};

module.exports = {
  formatIssuesList,
  getIssueIdFromSubGroupCode,
  handleIssueUpdate,
};
