/* eslint-disable object-property-newline */
/* eslint-disable camelcase */
const short = require("short-uuid");
const { MainGroup } = require("../models/MainGroup");

// a mongoose model for blog
const registerAsMainGroup = (data, bot) => {
  const { message, from } = data;
  const { title, id: groupId } = message.chat;
  const joinToken = short.generate();
  const obj = {
    registeredBy: from.username,
    registeredDate: message.date,
    subGroupIds: [],
    groupName: title,
    groupId,
    joinToken,
  };
  MainGroup.create(obj).then(() => {
    bot.editMessageText(`${message.chat.title} registerd as main group`, {
      chat_id: groupId,
      message_id: message.message_id,
    });
    bot.sendMessage(groupId, "Register sub groups using the following token:");
    bot.sendMessage(groupId, joinToken);
  });
};

const registerAsSubGroup = (data, bot) => {
  const { message, from } = data;
  const { title, id: groupId } = message.chat;
  bot.editMessageText(
    "Register with the join token received from the main group in the follwing format.\n/register token_received",
    {
      chat_id: groupId,
      message_id: message.message_id,
    }
  );
};

module.exports = { registerAsMainGroup, registerAsSubGroup };
