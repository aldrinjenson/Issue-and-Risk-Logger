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

const sendRecordsAsPdf = async (
  records = [],
  bot,
  opts,
  isSubGroup,
  entityName
) => {
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
          ? record.assignee.slice(1) // to embed telegram links in pdf
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
    filename: `${entityName}s List - ${groupName}.pdf`,
  };

  try {
    const pdfStream = await pdf.create(document, options);
    const sentMsg = await bot.sendDocument(groupId, pdfStream, {}, fileOptions);
    console.log("Pdf List sent to group", sentMsg.chat.title);
  } catch (err) {
    console.log("error in creating pdf stream " + err);
  }
};

module.exports = { sendRecordsAsPdf };
