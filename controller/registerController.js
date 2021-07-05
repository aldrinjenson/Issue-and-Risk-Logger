const short = require("short-uuid");
const { MainGroup } = require("../models/MainGroup");
const { SubGroup } = require("../models/SubGroup");
const { handleReplyMessage } = require("../utils/common");
const { generateGroupCode } = require("../utils/groupUtils");
const { AlreadyRegisteredGroup } = require("../utils/registerUtils");

const registerAsMainGroup = async (data, bot) => {
  const { message, from } = data;
  const { title, id: groupId } = message.chat;
  const registeredGroup = await AlreadyRegisteredGroup(groupId);

  if (registeredGroup) {
    // if already registered as main group
    bot.sendMessage(
      groupId,
      "Aleady registerd as main group\nUse the following token to register sub groups:\n"
    );
    bot.sendMessage(groupId, registeredGroup.joinToken);
    return;
  }

  const token = short.generate();
  const obj = {
    registeredBy: from.username,
    registeredDate: message.date,
    subGroupIds: [],
    groupName: title || "",
    groupId,
    joinToken: token,
  };
  const newGroup = new MainGroup(obj);
  newGroup.save().then(() => {
    bot.editMessageText(`"${message.chat.title}" registered as main group`, {
      chat_id: groupId,
      message_id: message.message_id,
    });
    bot.sendMessage(groupId, "Register sub groups using the following token:");
    bot.sendMessage(groupId, token);
  });
};

const handleTokenVerifyAndRegisterSubgroup = (msg, bot) => {
  const token = msg.text;
  const groupId = msg.chat.id;
  MainGroup.findOne({ joinToken: token }, async (err, mainGrp) => {
    if (err) {
      console.log("err " + err);
      return;
    } else if (!mainGrp) {
      bot.sendMessage(
        msg.chat.id,
        "Invalid token. Please verify and try again"
      );
      return;
    }
    const groupName = msg.chat.title;
    const groupCode = await generateGroupCode(mainGrp.groupId, groupName);

    mainGrp.subGroupIds = [...mainGrp.subGroupIds, groupId];
    mainGrp.save().then(async (doc) => {
      const newSubGroup = new SubGroup({
        registeredBy: msg.from.username,
        registeredDate: msg.date,
        mainGroupId: mainGrp.groupId,
        groupId,
        groupName,
        groupCode,
      });
      await newSubGroup.save();

      bot.sendMessage(
        msg.chat.id,
        `Connected to main group: "${mainGrp.groupName}"`
      );
      bot.sendMessage(
        doc.groupId,
        `New sub group "${msg.chat.title}" registered by @${msg.from.username}`
      );
    });
  });
};

const registerAsSubGroup = ({ message }, bot) => {
  const { id: groupId } = message.chat;
  const msgId = message.message_id;
  bot.editMessageText("Enter join token as a reply to this message", {
    chat_id: groupId,
    message_id: msgId,
  });
  handleReplyMessage(msgId, handleTokenVerifyAndRegisterSubgroup);
};

module.exports = { registerAsMainGroup, registerAsSubGroup };
