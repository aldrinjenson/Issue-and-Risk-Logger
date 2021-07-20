const excel = require("node-excel-export");
const fs = require("fs");
const { MainGroup } = require("../models/MainGroup");
const { Issue } = require("../models/Issue");
const { Risk } = require("../models/Risk");
const { Action } = require("../models/Action");
const { entities } = require("../constants");
const { getDateStrFromDateObj } = require("../utils/messageUtils");
const { toTitleCase } = require("../utils/misc");

const styles = {
  headerDark: {
    font: {
      bold: true,
    },
  },
  cellGreen: {
    fill: {
      fgColor: {
        rgb: "FF00FF00",
      },
    },
  },
};

const specification = {
  recordId: {
    headerStyle: styles.headerDark,
    displayName: "Issue ID",
    width: "10",
  },
  name: {
    displayName: "Issue Name",
    headerStyle: styles.headerDark,
    width: "35",
  },
  assignee: {
    headerStyle: styles.headerDark,
    displayName: "Assignee",
    width: "20",
  },
  criticalDate: {
    headerStyle: styles.headerDark,
    displayName: "Critical Date",
    width: "14",
    cellFormat: (val) => (val ? getDateStrFromDateObj(val) : "Nil"),
    cellStyle: { alignment: { horizontal: "left" } },
  },
  impact: {
    headerStyle: styles.headerDark,
    displayName: "Impact",
    width: "9",
    cellFormat: (val) => toTitleCase(val),
  },
  addedGroupName: {
    headerStyle: styles.headerDark,
    displayName: "Created Group",
    width: "15",
  },
  createdAt: {
    headerStyle: styles.headerDark,
    displayName: "Created Date",
    width: "14",
    cellFormat: (val) => getDateStrFromDateObj(val),
  },
  addedBy: {
    headerStyle: styles.headerDark,
    displayName: "Created By",
    width: "20",
    cellFormat: (val) => `@${val}`,
  },
  isOpen: {
    headerStyle: styles.headerDark,
    displayName: "Status",
    width: "20",
    cellFormat: (val) => (val ? "Open" : "Closed"),
  },
};

const generateReport = async (issuesList, risks, actions, bot, opts) => {
  const { groupId, groupName } = opts;
  const reportBuffer = excel.buildExport([
    {
      name: "Issues",
      specification: specification,
      data: issuesList,
    },
    {
      name: "Risks",
      specification: specification,
      data: risks,
    },
    {
      name: "Actions",
      specification: specification,
      data: actions,
    },
  ]);

  const fileOptions = {
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    filename: `${groupName} - Daily backup.xlsx`,
  };

  await bot.sendDocument(groupId, reportBuffer, {}, fileOptions);

  fs.writeFile("./report.xlsx", reportBuffer, (err) => {
    if (err) {
      console.error(err);
      return;
    }
  });
};

const getRecords = async (bot, opts) => {
  const { groupId, groupName } = opts;
  const issues = await Issue.find({ mainGroupId: groupId })
    .lean()
    .sort({ createdAt: -1 })
    .exec();
  const risks = await Risk.find({ mainGroupId: groupId })
    .lean()
    .sort({ createdAt: -1 })
    .exec();
  const actions = await Action.find({ mainGroupId: groupId })
    .lean()
    .sort({ createdAt: -1 })
    .exec();

  try {
    await generateReport(issues, risks, actions, bot, opts);
  } catch (error) {
    console.log("error in sending daily excel backup to " + groupName);
  }
};

const generateDailyBackup = async (bot) => {
  const maingroups = await MainGroup.find({}).lean().exec();
  const entityModels = Object.values(entities).map((entity) => entity.Model);

  const promises = [];
  for (const group of maingroups) {
    const opts = { groupId: group.groupId, groupName: group.groupName };
    promises.push(getRecords(bot, opts, entityModels));
  }
  Promise.all(promises)
    .then(() => console.log("Daily backups sent to all groups"))
    .catch(() => console.log("error in sending daily excel backup"));
};

module.exports = { generateDailyBackup };
