const { SubGroup } = require("../models");

const generateGroupCode = async (mainGroupId = "", newSubGroupName = "") => {
  const words = newSubGroupName.split(" ");
  const initials =
    words[0][0] +
    (words[1]?.[0] || newSubGroupName[newSubGroupName.length - 1]);

  try {
    const subGroups = await SubGroup.find({ mainGroupId }).lean().exec();
    const allSubGroupsCodes = subGroups.map((grp) => grp.groupCode);
    let index = 2; // start with 2
    //  add a numeral at the end if the codes match
    const checkAndUpdateCode = async (initials, num = null) => {
      const code = num ? initials + num : initials;
      if (!allSubGroupsCodes.includes(code)) {
        return code;
      } else {
        return checkAndUpdateCode(initials, index++);
        // recursively check with updated index till an unused code is found
      }
    };
    return checkAndUpdateCode(initials.toUpperCase());
  } catch (err) {
    console.log("error in db query" + err);
  }
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
