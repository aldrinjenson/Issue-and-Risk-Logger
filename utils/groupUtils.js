const { SubGroup } = require("../models/SubGroup");

const generateGroupCode = async (mainGroupId = "", newSubGroupName = "") => {
  return new Promise((resolve) => {
    let code =
      newSubGroupName[0] +
      newSubGroupName[1] +
      newSubGroupName[newSubGroupName.length - 1];

    SubGroup.find({ mainGroupId }, (err, subGroups) => {
      if (err) {
        console.log("err" + err);
        return;
      }

      const allSubGroupsCodes = subGroups.map((grp) => grp.groupCode);
      let index = 2;
      //  add a numeral at the end if the codes match
      const checkAndUpdateCode = async (newCode) => {
        if (!allSubGroupsCodes.includes(newCode)) {
          resolve(newCode);
          return;
        }
        checkAndUpdateCode(newCode + index++);
      };

      checkAndUpdateCode(code.toUpperCase());
    });
  });
};

module.exports = { generateGroupCode };
