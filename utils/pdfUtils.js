const pdf = require("pdf-creator-node");
const fs = require("fs");
const { getDateStrFromDateObj } = require("./messageUtils");
const { toTitleCase } = require("./misc");
const pdfTemplate = fs.readFileSync("pdfTemplate.html", "utf8");

const options = {
  format: "A3",
  orientation: "landscape",
  border: "6mm",
  type: "pdf",
};

const sendRecordsAsPdf = (records = [], bot, opts, isSubGroup, entityName) => {
  const { groupId, groupName } = opts;
  bot.sendMessage(groupId, `${records.length} ${entityName}s registered`);

  const modfiedRecords = records.map((record) => {
    return {
      ...record,
      criticalDate: getDateStrFromDateObj(record.criticalDate),
      createdAt: getDateStrFromDateObj(record.createdAt),
      isAssigneeNameUserName: record.assignee && record.assignee[0] === "@",
      assignee:
        record.assignee && record.assignee[0] === "@"
          ? record.assignee.slice(1) // to generate telegram links
          : record.assignee,
      impact: toTitleCase(record.impact),
    };
  });

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
  };

  const fileOptions = {
    contentType: "application/pdf",
    filename: `${entityName}s List - ${groupName}`,
  };

  pdf
    .create(document, options)
    .then((stream, err) => {
      if (err) {
        console.log("error in creating pdf stream " + err);
        return;
      }
      bot.sendDocument(groupId, stream, {}, fileOptions);
    })
    .catch((err) => {
      console.error(console.log("Error: " + err));
    });
};

module.exports = { sendRecordsAsPdf };
