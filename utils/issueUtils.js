const { Issue } = require("../models/Issue");
const { handleButtons, handleReplyMessage } = require("./common");

const formatIssues = (issuesList = [], isSubGroup) => {
  let msg = "";
  issuesList.forEach((issue, index) => {
    const status = issue.isOpen ? "Open" : "Closed";
    msg += `${index + 1}. ${issue.name}\n    Critical Date: ${
      issue.criticalDate || "nil"
    }\n    Added by @${issue.addedBy}\n    Status: ${status}\n`;
    // adding 4 spaces before each new line for nice formatting :)
    if (!isSubGroup) {
      msg += `    sub-group: ${issue.addedGroupName}\n`;
    }
    msg += "\n";
  });
  return msg;
};

const transformStatusToBooelan = (val = "") => {
  // return the isOpenStatus
  const isDoneSynonyms = ["done", "completed", "finished", "closed", "close"];
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
    }
    Issue.updateOne({ _id: issueId }, { [key]: val })
      .then((res) => {
        console.log("Modified record " + res.nModified);
        bot.sendMessage(groupId, `${label} has been updated successfully`);
      })
      .catch((err) => {
        handleError(err);
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

module.exports = { formatIssues, handleUpdateField, handleIssueUpdate };
