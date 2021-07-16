const getDateStrFromDateObj = (dateObj) => {
  // can be null or a new Date object
  if (dateObj) {
    const dd = dateObj.getDate();
    const mm = dateObj.getMonth();
    const yy = dateObj.getFullYear();

    return `${dd}/${mm + 1}/${yy}` || dateObj;
  }
  return "Nil";
};

const formatRecordsList = (recordsList = [], isSubGroup, entity) => {
  let msg = "";
  recordsList.forEach((record, index) => {
    const { name, recordId, assignee, impact, addedBy } = record;
    const status = record.isOpen ? "Open" : "Closed";
    const criticalDate = getDateStrFromDateObj(record.criticalDate);

    msg += `${index + 1}. ${name}\n    ${
      entity.label
    }Id: ${recordId}\n    Critical Date: ${criticalDate}\n    Added by @${addedBy}\n    Assigned to: ${
      assignee || "nil"
    }\n    Impact: ${impact}\n    Status: ${status}\n`;

    // adding 4 spaces before each new line for nice formatting :)
    if (!isSubGroup) {
      msg += `    Group: ${record.addedGroupName}\n`;
    }
    msg += "\n";
  });
  return msg;
};

const getStringifiedRecord = (record, shouldShowStatus = false) => {
  const { name, recordId, assignee, criticalDate, impact, type } = record;
  const date = getDateStrFromDateObj(criticalDate);
  const status = record.isOpen ? "Open" : "Closed";

  let msg = `Title: ${name}\n${type} ID: ${recordId}\nAssigned to: ${
    assignee || "Nil"
  }\nCritical date: ${date}\nImpact: ${impact}`;

  if (shouldShowStatus) {
    msg += `\nStatus: ${status}`;
  }
  return msg;
};

const sendEntityAddSuccessMsg = (groupId, bot, savedRec, entity) => {
  const { type, addedGroupName, mainGroupId, addedBy } = savedRec;
  const stringifiedRecord = getStringifiedRecord(savedRec);

  bot.sendMessage(groupId, `New ${type} registered as:\n${stringifiedRecord}`);
  if (entity.shouldShowInMainGroup) {
    bot.sendMessage(
      mainGroupId,
      `New ${type} registered in "${addedGroupName}" by @${addedBy} as:\n${stringifiedRecord}`
    );
  }
};

const sendUpdateSuccessMsg = (label, record, opts) => {
  const { groupId, bot, entity } = opts;
  const stringifiedRecord = getStringifiedRecord(record, true);
  bot.sendMessage(
    groupId,
    `${label} has been updated successfully\n\nUpdated ${entity.name}:\n${stringifiedRecord}`
  );
  if (entity.shouldShowInMainGroup) {
    bot.sendMessage(
      record.mainGroupId,
      `${label} has been updated for "${record.name}" in "${record.addedGroupName}" by @${record.addedBy}\n\nUpdated record: ${stringifiedRecord}`
    );
  }
};

module.exports = {
  getStringifiedRecord,
  getDateStrFromDateObj,
  sendEntityAddSuccessMsg,
  formatRecordsList,
  sendUpdateSuccessMsg,
};
