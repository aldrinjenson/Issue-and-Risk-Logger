const { SubGroup } = require("../models/SubGroup");

const generateGroupCode = async (mainGroupId = "", newSubGroupName = "") => {
  return new Promise((resolve) => {
    let words = newSubGroupName.split(" ");
    // for accounting to groups which may have a single word
    let code =
      words[0][0] +
      (words[1]?.[0] || newSubGroupName[newSubGroupName.length - 1][0]);

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

const handleIsFromPrivateMessage = async (msg, bot) => {
  if (msg.chat.type === "private") {
    const chatId = msg.chat.id;
    await bot.sendMessage(
      chatId,
      "These commands can be used only after adding the bot to a group"
    );
    return true;
  }
  return false;
};

module.exports = { generateGroupCode, handleIsFromPrivateMessage };
