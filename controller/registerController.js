/* eslint-disable object-property-newline */
/* eslint-disable camelcase */
const short = require("short-uuid");
const { MainGroup } = require("../models/MainGroup");
const { SubGroup } = require("../models/SubGroup");
const { handleReplyMessage } = require("../utils/common");

const registerAsMainGroup = (data, bot) => {
  const { message, from } = data;
  const { title, id: groupId } = message.chat;
  const joinToken = short.generate();
  const obj = {
    registeredBy: from.username,
    registeredDate: message.date,
    subGroupIds: [],
    groupName: title || "",
    groupId,
    joinToken,
  };
  const newGroup = new MainGroup(obj);
  newGroup.save().then(() => {
    bot.editMessageText(`${message.chat.title} registerd as main group`, {
      chat_id: groupId,
      message_id: message.message_id,
    });
    bot.sendMessage(groupId, "Register sub groups using the following token:");
    bot.sendMessage(groupId, joinToken);
  });
};

const handleTokenVerifyAndRegisterSubgroup = (msg, bot) => {
  const token = msg.text;
  const groupId = msg.chat.id;
  MainGroup.findOne({ joinToken: token }, (err, grp) => {
    if (err) {
      console.log("err " + err);
      return;
    } else if (!grp) {
      bot.sendMessage(
        msg.chat.id,
        "Invalid token. Please verify and try again"
      );
      return;
    }

    grp.subGroupIds = [...grp.subGroupIds, groupId];
    grp.save().then(async (doc) => {
      const newSubGroup = new SubGroup({
        registeredBy: msg.from.username,
        registeredDate: msg.date,
        mainGroupId: grp.groupId,
        groupId,
      });
      await newSubGroup.save();
      console.log("saved");
      console.log(doc);

      bot.sendMessage(
        msg.chat.id,
        `Connected to main group: "${grp.groupName}"`
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
