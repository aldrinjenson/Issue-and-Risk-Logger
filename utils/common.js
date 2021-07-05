/* eslint-disable no-prototype-builtins */
const { MainGroup } = require("../models/MainGroup");

const messageReplyPairs = {};
const handleReplyMessage = (msgId, callBack) => {
  messageReplyPairs[msgId] = callBack;
};

const getButtonChooserValue = async (groupId, buttonRows, prompt, bot) =>
  new Promise((resolve) => {
    {
      const cb = (msg) => {
        const selectedVal = msg.text;
        resolve(selectedVal);
      };
      const markupRows = buttonRows.map((row) => {
        return { text: row.text, callback_data: row.val };
      });
      const keyboardOptions = {
        reply_markup: {
          keyboard: [markupRows],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      };
      bot.sendMessage(groupId, prompt, keyboardOptions).then((sentMsg) => {
        handleReplyMessage(sentMsg.message_id, cb);
      });
    }
  });

const callBackKeys = {};
// custom wrapper to make inline keyboards with callback easy
const handleButtons = (rows) => {
  const isSingleLinedBetter = rows.length > 3; // if more than 3 items shows up, then show them in separate lines to prevent congestion
  const markupRows = rows.map((row) => {
    const key = row.text;
    callBackKeys[key] = row.onPress;
    const keyBoardRow = { text: row.text, callback_data: key };
    return isSingleLinedBetter ? [keyBoardRow] : keyBoardRow;
  });

  return {
    reply_markup: {
      inline_keyboard: isSingleLinedBetter ? markupRows : [markupRows],
    },
  };
};

const checkIfMainGroup = (groupId) =>
  new Promise((resolve) => {
    MainGroup.find({ groupId }, (err, data) => {
      if (err) {
        console.log("error " + err);
        return;
      }
      if (data.length) {
        resolve(true);
      } else resolve(false);
    });
  });

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

// function to easily get answers to a set of ordered prompts
const handleReplyFlow = (promptsList, message, bot) =>
  new Promise((resolve) => {
    // console.log({ message });
    const values = {};
    const handleFlow = (prompts) => {
      if (!prompts.length) {
        resolve(values); // when finished asking all the prompts from list
        return;
      }
      const cb = async (msg) => {
        // called from index.js when a reply has been received
        const val = msg.text;
        if (
          prompts[0].hasOwnProperty("condition") &&
          !prompts[0].condition(val)
        ) {
          // if the user inputs an invalid value, ask him to enter again
          await bot.sendMessage(
            message.chat.id,
            "Invalid entry. Please verify and try again"
          );
          handleFlow(prompts, values); // recursive calling to ensure that the function gets called only after the user has given a suitable answer to the previous question
        } else {
          const { key } = prompts[0];
          values[key] = val;
          prompts.shift(); // removing the first question after the user has given the answer to it
          handleFlow(prompts, values); // recursive calling to ensure that the function gets called only after the user has given a suitable answer to the previous question
        }
      };
      bot.sendMessage(message.chat.id, prompts[0].prompt).then((sentMsg) => {
        handleReplyMessage(sentMsg.message_id, cb);
      });
    };
    handleFlow(promptsList);
  });

module.exports = {
  callBackKeys,
  getButtonChooserValue,
  handleButtons,
  handleIsFromPrivateMessage,
  messageReplyPairs,
  handleReplyMessage,
  handleReplyFlow,
  checkIfMainGroup,
};
