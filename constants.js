const { Action } = require("./models/Action");
const { Issue } = require("./models/Issue");
const { Risk } = require("./models/Risk");
const { getKeyboardOptions } = require("./utils/common");
const { getDateStrfromDateObj } = require("./utils/messageUtils");

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
    updatableFields: ["name", "criticalDate", "assignee", "impact", "isOpen"], // not currently used
  },
  risk: {
    name: "risk",
    label: "Risk",
    Model: Risk,
    shouldShowInMainGroup: true,
    fieldsCollected: ["name", "criticalDate", "assignee", "impact"],
    updatableFields: ["name", "criticalDate", "assignee", "impact", "isOpen"],
  },
  action: {
    name: "action",
    label: "Action",
    Model: Action,
    shouldShowInMainGroup: false,
    fieldsCollected: ["name", "criticalDate", "assignee", "impact"],
    updatableFields: ["name", "criticalDate", "assignee", "impact", "isOpen"],
  },
};

const dateValidator = (dateString) => {
  const dateParts = dateString.split("/");
  if (dateParts.length !== 3) {
    return false;
  }
  let [dd, mm, yy] = dateParts;
  return +dd <= 31 && +mm <= 12 && (yy.length === 2 || yy.length === 4);
};

// takes a string like 22/04/21 or 22/04/2021 and returns a JS Date object
const convertDateStringToDate = (dateString) => {
  const dateParts = dateString.split("/");
  let [dd, mm, yy] = dateParts;
  if (yy.length === 2) {
    yy = "20" + yy;
  }
  // note: months start from 0 in javascript
  // new Date accepts params in yy, mm, dd format
  const newDate = new Date(yy, +mm - 1, dd);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

const isDoneSynonyms = [
  "done",
  "completed",
  "finished",
  "closed",
  "close",
  "complete",
  "fixed",
];

// all possible fields which can be collected from the user as reply
// condition and formatter fields are optional
const allPromptFields = (entity, key) => {
  const fields = {
    name: {
      key: "name",
      prompt: `Enter ${entity.name} name as a reply to this message`,
      condition: (name) => name.length >= 4,
    },
    criticalDate: {
      key: "criticalDate",
      prompt: `Enter critical date in dd/mm/yy form as a reply to this message\neg: ${getDateStrfromDateObj(
        new Date()
      )}\nEnter . to skip entering date`,
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
    isOpen: {
      key: "isOpen", // boolean
      prompt: `Enter new status as a reply to this message\neg: closed`,
      condition: (status) => isDoneSynonyms.includes(status.toLowerCase()),
      formatter: (status) => !isDoneSynonyms.includes(status.toLowerCase()), // returns boolean
    },
  };
  return fields[key];
};

module.exports = { entities, allPromptFields };
