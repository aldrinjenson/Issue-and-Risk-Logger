const pdf = require("pdf-creator-node");
const fs = require("fs");
const { getDateStrfromDateObj } = require("./messageUtils");
const pdfTemplate = fs.readFileSync("pdfTemplate.html", "utf8");

const options = {
  format: "letter",
  orientation: "portrait",
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
  const { id: groupId, title: groupName } = message.chat;
  const modfiedRecords = records.map((record) => ({
    ...record,
    criticalDate: getDateStrfromDateObj(record.criticalDate),
  }));

  const document = {
    html: pdfTemplate,
    data: {
      records: modfiedRecords,
      date: new Date().toLocaleString(),
      isSubGroup,
      entityName,
      groupName,
    },
    type: "stream",
  };

  pdf
    .create(document, options)
    .then((stream) => {
      bot.sendDocument(groupId, stream, {
        contentType: "application/pdf",
      });
    })
    .catch((err) => {
      console.error(console.log("Error: " + err));
    });
};

module.exports = { sendRecordsAsPdf };
