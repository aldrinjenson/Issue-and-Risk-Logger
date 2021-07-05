const { handleButtons, handleReplyMessage } = require("./common");

const formatRecordsList = (recordsList = [], isSubGroup, entity) => {
  let msg = "";
  recordsList.forEach((record, index) => {
    const status = record.isOpen ? "Open" : "Closed";

    msg += `${index + 1}. ${record.name}\n    ${entity.name}Id: ${
      record.recordId
    }\n    Critical Date: ${record.criticalDate || "nil"}\n    Added by @${
      record.addedBy
    }\n    Assigned to: ${record.assignee || "nil"}\n    Status: ${status}\n`;

    // adding 4 spaces before each new line for nice formatting :)
    if (!isSubGroup) {
      msg += `    Group: ${record.addedGroupName}\n`;
    }
    msg += "\n";
  });
  return msg;
};

const handleListRecords = (
  recordsList = [],
  bot,
  message,
  isSubGroup,
  entity
) => {
  const groupId = message.chat.id;
  const stringifiedRecordsList = formatRecordsList(
    recordsList,
    isSubGroup,
    entity
  );
  bot.sendMessage(
    groupId,
    stringifiedRecordsList.length
      ? stringifiedRecordsList
      : `No open ${entity.name}s`
  );
};

const handleGroupFilter = async (selectedGroupId, { message }, bot, entity) => {
  const records = await entity.Model.find({
    addedGroupId: selectedGroupId,
    isOpen: true,
  })
    .sort("recordId")
    .exec();
  handleListRecords(records, bot, message, false, entity);
};

const getRecordId = async (groupId, groupCode, entity) => {
  let count = await entity.Model.countDocuments({
    addedGroupId: groupId,
  }).exec();
  let id = groupCode;
  console.log(entity.name);
  switch (entity.name) {
    case "issue":
      id += "/I";
      break;
    case "risk":
      id += "/R";
      break;
    case "action":
      id += "/A";
      break;
    default:
      // shouldn't echnically ever reach this case :)
      console.log("invalid entry");
  }
  id += `-${count + 1}`;
  return id;
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

const sendUpdateSuccessMsg = (label, record, groupId, msg, entity, bot) => {
  const status = record.isOpen ? "Open" : "Closed";
  const updateSuccessReply = `${record.name}\n${entity.name} ID: ${record.recordId}\nCritical Date: ${record.criticalDate}\nStatus: ${status} `;
  bot.sendMessage(
    groupId,
    `${label} has been updated successfully\n\nUpdated record:\n${updateSuccessReply}`
  );
  if (entity.shouldLogToMainGroup) {
    bot.sendMessage(
      record.mainGroupId,
      `${label} has been updated for "${record.name}" in "${record.addedGroupName}" by @${msg.from.username}\n\nUpdated record: ${updateSuccessReply}`
    );
  }
};

const handleUpdateField = (key, label, { recordId, groupId, bot, entity }) => {
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
    entity.Model.findOne({ _id: recordId }, (err, record) => {
      if (err) {
        handleError(err);
        return;
      }
      if (record[key] === val) {
        bot.sendMessage(groupId, `${label} is already same`);
        return;
      }
      record[key] = val;
      record.save().then((savedRec) => {
        sendUpdateSuccessMsg(label, savedRec, groupId, msg, entity, bot);
      });
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

const handleRecordUpdate = (
  recordId,
  { message: { chat, message_id } },
  bot,
  entity
) => {
  const { id: groupId } = chat;
  const opts = {
    recordId,
    groupId,
    message_id,
    bot,
    entity,
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
  getRecordId,
  handleRecordUpdate,
  handleGroupFilter,
  handleListRecords,
};
