const { allPromptFields } = require("../constants");
const { handleButtons, handleReplyFlow } = require("./common");
const { formatRecordsList, sendUpdateSuccessMsg } = require("./messageUtils");

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
    .sort("createdAt")
    .exec();
  handleListRecords(records, bot, message, false, entity);
};

const makeRecordId = async (groupId, groupCode, entity) => {
  let count = await entity.Model.countDocuments({
    addedGroupId: groupId,
  }).exec();
  let id = groupCode;
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

const handleUpdateField = async (key, label, opts) => {
  const { recordId, groupId, bot, entity } = opts;
  const field = allPromptFields(entity, key);
  await bot.sendMessage(groupId, `Enter new value of ${label}`);
  const values = await handleReplyFlow([field], groupId, bot);
  const val = values[key];

  entity.Model.findOne({ _id: recordId }, (err, record) => {
    if (err) {
      console.log(err);
      return;
    }
    if (record[key] === val) {
      bot.sendMessage(groupId, `${label} is already same`);
      return;
    }
    record[key] = val;
    record
      .save()
      .then((savedRec) => {
        sendUpdateSuccessMsg(label, savedRec, opts);
      })
      .catch((err) => {
        console.log(err);
        bot.sendMessage(
          groupId,
          "There seems to be some error in saving. Please review your input and try again"
        );
      });
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
      text: "Assignee",
      onPress: () => handleUpdateField("assignee", "Assignee", opts),
    },
    {
      text: "Impact",
      onPress: () => handleUpdateField("impact", "Impact", opts),
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
  makeRecordId,
  handleRecordUpdate,
  handleGroupFilter,
  handleListRecords,
};
