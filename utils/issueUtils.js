const formatIssues = (issuesList = [], isSubGroup) => {
  let msg = "";
  issuesList.forEach((issue, index) => {
    msg += `${index + 1}. ${issue.name}\n    Critical Date: ${
      issue.criticalDate || "nil"
    }\n    Added by @${issue.addedBy}\n`;
    // adding 4 spaces before each new line for nice formatting :)
    if (!isSubGroup) {
      msg += `    sub-group: ${issue.addedGroupName}\n\n`;
    }
  });
  return msg;
};

module.exports = { formatIssues };
