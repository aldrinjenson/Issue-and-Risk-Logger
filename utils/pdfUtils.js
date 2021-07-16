const pdf = require("pdf-creator-node");
const fs = require("fs");
const { getDateStrFromDateObj } = require("./messageUtils");
const { tempData, tempMessage } = require("./data");
const { toTitleCase } = require("./misc");
const pdfTemplate = fs.readFileSync("pdfTemplate.html", "utf8");

const options = {
  format: "A3",
  orientation: "landscape",
  border: "6mm",
  type: "pdf",
};

const sendRecordsAsPdf = (
  records = [],
  bot,
  message,
  isSubGroup,
  entityName
) => {
  console.log(records);
  const { id: groupId, title: groupName } = message.chat;
  const modfiedRecords = records.map((record) => {
    return {
      ...record,
      criticalDate: getDateStrFromDateObj(record.criticalDate),
      createdAt: getDateStrFromDateObj(record.createdAt),
      isAssigneeNameUserName: record.assignee && record.assignee[0] === "@",
      impact: toTitleCase(record.impact),
    };
  });
  console.log(modfiedRecords);

  const document = {
    html: pdfTemplate,
    data: {
      records: modfiedRecords,
      date: new Date().toLocaleString(),
      isMainGroup: !isSubGroup,
      entityName,
      groupName,
    },
    type: "stream",
    path: "./output.pdf",
  };
  const filename = entityName + "list" + new Date().toLocaleString();
  console.log(filename);
  pdf
    .create(document, options)
    .then((stream) => {
      bot.sendDocument(groupId, stream, {
        contentType: "application/pdf",
        filename,
      });
    })
    .catch((err) => {
      console.error(console.log("Error: " + err));
    });
};

// sendRecordsAsPdf(tempData, null, tempMessage, true, "Issue");

module.exports = { sendRecordsAsPdf };
