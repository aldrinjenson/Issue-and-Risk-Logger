const formatRecordsList = (recordsList = [], isSubGroup, entity) => {
  let msg = "";
  recordsList.forEach((record, index) => {
    const status = record.isOpen ? "Open" : "Closed";

    msg += `${index + 1}. ${record.name}\n    ${entity.label}Id: ${
      record.recordId
    }\n    Critical Date: ${
      new Date(record.criticalDate).toLocaleDateString() || "nil"
    }\n    Added by @${record.addedBy}\n    Assigned to: ${
      record.assignee || "nil"
    }\n    Impact: ${record.impact}\n    Status: ${status}\n`;

    // adding 4 spaces before each new line for nice formatting :)
    if (!isSubGroup) {
      msg += `    Group: ${record.addedGroupName}\n`;
    }
    msg += "\n";
  });
  return msg;
};

const sendEntityAddSuccessMsg = (groupId, bot, savedRec, entity) => {
  const {
    type,
    name,
    recordId,
    assignee,
    criticalDate,
    impact,
    addedGroupName,
    mainGroupId,
    addedBy,
  } = savedRec;
  bot.sendMessage(
    groupId,
    `New ${type} registered as:\nTitle: ${name}\n${type} ID: ${recordId}\nAssigned to: ${
      assignee || "Nil"
    }\nCritical date: ${
      new Date(criticalDate).toLocaleDateString() || "Nil"
    }\nImpact: ${impact}`
  );
  if (entity.shouldShowInMainGroup) {
    bot.sendMessage(
      mainGroupId,
      `New ${type} registered in "${addedGroupName}" by @${addedBy} as:\nName: ${name}\n${type} ID: ${recordId}\nAssigned to: ${
        assignee || "Nil"
      }\nCritical date: ${
        new Date(criticalDate).toLocaleDateString() || "Nil"
      }\nImpact: ${impact}`
    );
  }
};

const sendUpdateSuccessMsg = (label, record, opts) => {
  const { groupId, bot, entity } = opts;
  const status = record.isOpen ? "Open" : "Closed";
  const updateSuccessReply = `${record.name}\n${entity.name} ID: ${
    record.recordId
  }\nCritical Date: ${record.criticalDate || "nil"}\nImpact: ${
    record.impact
  }\nStatus: ${status} `;

  bot.sendMessage(
    groupId,
    `${label} has been updated successfully\n\nUpdated ${entity.name}:\n${updateSuccessReply}`
  );
  if (entity.shouldShowInMainGroup) {
    bot.sendMessage(
      record.mainGroupId,
      `${label} has been updated for "${record.name}" in "${record.addedGroupName}" by @${record.addedBy}\n\nUpdated record: ${updateSuccessReply}`
    );
  }
};

module.exports = {
  sendEntityAddSuccessMsg,
  formatRecordsList,
  sendUpdateSuccessMsg,
};
