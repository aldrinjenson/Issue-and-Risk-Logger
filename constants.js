const { Action } = require("./models/Action");
const { Issue } = require("./models/Issue");
const { Risk } = require("./models/Risk");

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

const entities = {
  issue: {
    name: "issue",
    label: "Issue",
    Model: Issue,
    shouldShowInMainGroup: true,
  },
  risk: {
    name: "risk",
    label: "Risk",
    Model: Risk,
    shouldShowInMainGroup: true,
  },
  action: {
    name: "action",
    label: "Action",
    Model: Action,
    shouldShowInMainGroup: false,
  },
};

module.exports = { entities, impactButtons };
