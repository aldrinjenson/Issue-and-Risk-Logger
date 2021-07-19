const { allPromptFields } = require("../constants");
const { handleButtons, handleReplyFlow } = require("./common");
const {
  formatRecordsList,
  sendUpdateSuccessMsg,
  getStringifiedRecord,
} = require("./messageUtils");
const { areValuesEqual } = require("./misc");
const { sendRecordsAsPdf } = require("./pdfUtils");

const handleListRecords = async (
  recordsList = [],
  bot,
  opts,
  isSubGroup,
  entityName
) => {
  if (recordsList.length >= 5) {
    await sendRecordsAsPdf(recordsList, bot, opts, isSubGroup, entityName);
    return;
  }

  const stringifiedRecordsList = formatRecordsList(
    recordsList,
    isSubGroup,
    entityName
  );
  await bot.sendMessage(
    opts.groupId,
    stringifiedRecordsList.length
      ? stringifiedRecordsList
      : `No ${entityName}s registered`
  );
};

const handleGroupFilter = async (selectedGroupId, { message }, bot, entity) => {
  const records = await entity.Model.find({
    addedGroupId: selectedGroupId,
    isOpen: true,
  })
    .lean()
    .sort("createdAt")
    .exec();

  const { id: groupId, title: groupName } = message.chat;
  const opts = { groupId, groupName };

  handleListRecords(records, bot, opts, false, entity.label);
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
      // shouldn't technically ever reach this case :)
      console.log("invalid entry");
  }
  id += `-${count + 1}`;
  return id;
};

const handleUpdateField = async (key, label, opts) => {
  const { recordId, groupId, bot, entity } = opts;
  const field = allPromptFields(entity, key);
  const values = await handleReplyFlow([field], groupId, bot);
  const val = values[key];

  entity.Model.findOne({ _id: recordId }, (err, record) => {
    if (err) {
      console.log(err);
      return;
    }
    if (areValuesEqual(record[key], val)) {
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

const handleRecordUpdate = async (record, message, bot, entity) => {
  const { chat, message_id } = message;
  const { id: groupId } = chat;
  const opts = {
    recordId: record._id,
    groupId,
    message_id,
    bot,
    entity,
  };
  const stringifiedRecord = getStringifiedRecord(record, true);
  await bot.sendMessage(groupId, stringifiedRecord);
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
