const ISSUE = {
  label: "issue",
};

const RISK = {
  label: "risk",
};

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
  },
  risk: {
    name: "risk",
  },
  action: {},
};

module.exports = { entities, IMPACT_CONSTANTS };
