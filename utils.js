/* eslint-disable object-property-newline */
/* eslint-disable camelcase */

const callBackKeys = {};

const handleButtons = (rows) => {
  const markupRows = rows.map((row) => {
    const key = row.text;
    // console.log(key)
    callBackKeys[key] = row.callback;
    return { text: row.text, callback_data: key };
  });

  return {
    reply_markup: {
      inline_keyboard: [markupRows],
    },
  };
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

module.exports = { handleButtons, callBackKeys, handleIsFromPrivateMessage };
