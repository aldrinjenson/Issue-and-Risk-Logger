const { Action } = require("./models/Action");
const { Issue } = require("./models/Issue");
const { Risk } = require("./models/Risk");
const { getKeyboardOptions } = require("./utils/common");

const impactButtons = [
  {
    text: `High`,
    val: "high",
  },
  {
    text: `Medium`,
    val: "medium",
  },
  {
    text: `Low`,
    val: "low",
  },
];

// add further entities if needed following the pattern
const entities = {
  issue: {
    name: "issue",
    label: "Issue",
    Model: Issue,
    shouldShowInMainGroup: true,
    fieldsCollected: ["name", "criticalDate", "assignee", "impact"],
  },
  risk: {
    name: "risk",
    label: "Risk",
    Model: Risk,
    shouldShowInMainGroup: true,
    fieldsCollected: ["name", "criticalDate", "assignee", "impact"],
  },
  action: {
    name: "action",
    label: "Action",
    Model: Action,
    shouldShowInMainGroup: false,
    fieldsCollected: ["name", "criticalDate", "assignee", "impact"],
  },
};

const convertDateStringToDate = (dateString) => {
  // takes a string like 22/04/21 or 22/04/2021 and returns a JS Date object
  const dateParts = dateString.split("/");
  let [dd, mm, yy] = dateParts;
  if (yy.length === 2) {
    yy = "20" + yy;
  }
  return new Date(yy, mm, dd) || dateString;
};

const dateValidator = (dateString) => {
  const dateParts = dateString.split("/");
  if (dateParts.length !== 3) {
    return false;
  }
  let [dd, mm] = dateParts;
  return +dd <= 31 && +mm <= 12;
};

// all possible fields which can be collected from the user as reply
const allPromptFields = (entity, field) => {
  const fields = {
    name: {
      key: "name",
      prompt: `Enter ${entity.name} name as a reply to this message`,
      condition: (name) => name.length >= 4,
    },
    criticalDate: {
      key: "criticalDate",
      prompt:
        "Enter critical date in dd/mm/yy form as a reply to this message\neg: 28/06/21\nEnter . to skip entering date",
      condition: (dateStr) => dateStr === "." || dateValidator(dateStr),
      formatter: (dateStr) =>
        dateStr === "." ? null : convertDateStringToDate(dateStr),
    },
    assignee: {
      key: "assignee",
      prompt: `Choose Assignee\nEnter username in the format: @username as a reply to this message\nEnter . to skip adding assignee`,
      condition: (userName) =>
        userName === "." ||
        (userName[0] === "@" && userName.split(" ").length === 1),
      formatter: (nameStr) => (nameStr === "." ? null : nameStr.trim()),
    },
    impact: {
      key: "impact",
      prompt: `Choose impact/severity of ${entity.name}: `,
      condition: (val) => ["high", "medium", "low"].includes(val.toLowerCase()),
      keyboard: getKeyboardOptions(impactButtons),
      formatter: (val) => val.toLowerCase(),
    },
  };
  return fields[field];
};

module.exports = { entities, allPromptFields };
