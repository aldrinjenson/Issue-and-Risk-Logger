const { Action } = require("./models/Action");
const { Issue } = require("./models/Issue");
const { Risk } = require("./models/Risk");

const IMPACT_CONSTANTS = {
  HIGH: {
    name: "high",
    value: 1,
  },
  MED: {
    name: "medium",
    value: 0,
  },
  LOW: {
    name: "low",
    value: -1,
  },
};

const entities = {
  issue: {
    name: "issue",
    label: "Issue",
    Model: Issue,
    shouldLogToMainGroup: true,
  },
  risk: {
    name: "risk",
    label: "Risk",
    Model: Risk,
    shouldLogToMainGroup: true,
  },
  action: {
    name: "action",
    label: "Action",
    Model: Action,
    shouldLogToMainGroup: false,
  },
};

module.exports = { entities, IMPACT_CONSTANTS };
