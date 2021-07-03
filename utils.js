/* eslint-disable no-inline-comments */
/* eslint-disable line-comment-position */
/* eslint-disable object-property-newline */
/* eslint-disable camelcase */

const callBackKeys = {};

const handleButtons = (rows) => {
  const markupRows = rows.map((row) => {
    const key = row.text;
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

const messageReplyPairs = {};

const handleReplyMessage = (msgId, callBack) => {
  messageReplyPairs[msgId] = callBack;
};

// eslint-disable-next-line max-params
const handleReplyFlow = (promptsList, message, bot) =>
  new Promise((resolve) => {
    const values = {};
    const handleFlow = (prompts) => {
      if (!prompts.length) {
        resolve(values); // when finished asking all the prompts from list
        return;
      }
      const cb = (msg) => {
        // called from index.js when a reply has been received
        // eslint-disable-next-line prefer-destructuring
        const { key } = prompts[0];
        const val = msg.text;
        values[key] = val;
        prompts.shift(); // removing the first question after the user has given the answer to it
        handleFlow(prompts, values); // recursive calling to ensure that the function gets called only after the user has given a suitable answer to the previous question
      };
      bot.sendMessage(message.chat.id, prompts[0].prompt).then((sentMsg) => {
        handleReplyMessage(sentMsg.message_id, cb);
      });
    };
    handleFlow(promptsList);
  });

module.exports = {
  handleButtons,
  callBackKeys,
  handleIsFromPrivateMessage,
  messageReplyPairs,
  handleReplyMessage,
  handleReplyFlow,
};
