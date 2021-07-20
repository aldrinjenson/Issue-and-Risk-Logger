/* eslint-disable no-prototype-builtins */
const { MainGroup } = require("../models");

// takes buttons and returns markup for regular keyboard
const getKeyboardOptions = (buttons) => {
  const markupRows = buttons.map((row) => {
    return { text: row.text, callback_data: row.val };
  });
  return {
    reply_markup: {
      keyboard: [markupRows],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  };
};

const callBackKeys = {};
// wrapper to make inline keyboards with callback easy
const handleButtons = (rows) => {
  const markupRows = [];
  let newRow = [];

  for (let i = 0; i < rows.length; i++) {
    const key = rows[i].text;
    callBackKeys[key] = rows[i].onPress;

    const keyBoardRow = { text: key, callback_data: key };
    newRow.push(keyBoardRow);

    if (i % 2 !== 0 || i === rows.length - 1) {
      markupRows.push(newRow);
      newRow = [];
    }
  }

  return {
    reply_markup: {
      inline_keyboard: markupRows,
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

const messageReplyPairs = {};
const handleReplyMessage = (msgId, callBack) => {
  messageReplyPairs[msgId] = callBack;
};

// function to get user input replies to a set of ordered prompts
const handleReplyFlow = (promptsList, groupId, bot) =>
  new Promise((resolve) => {
    const values = {};
    const handleFlow = (prompts) => {
      if (!prompts.length) {
        resolve(values); // when finished asking all the prompts from list
        return;
      }
      // called when a reply has been received
      const cb = async (msg) => {
        let val = msg.text;
        if (
          prompts[0].hasOwnProperty("condition") &&
          !prompts[0].condition(val)
        ) {
          // if the user inputs an invalid value, ask him to enter again
          await bot.sendMessage(
            groupId,
            "Invalid entry. Please verify and try again"
          );
          handleFlow(prompts, values); // recursive calling to ensure that the function gets called only after the user has given a suitable answer to the previous question
        } else {
          const { key, formatter } = prompts[0];
          if (formatter) {
            val = formatter(val);
          }
          values[key] = val;
          prompts.shift(); // removing the first question after the user has given the answer to it
          handleFlow(prompts, values); // recursive calling to ensure that the function gets called only after the user has given a suitable answer to the previous question
        }
      };
      bot
        .sendMessage(groupId, prompts[0].prompt, prompts[0].keyboard) //keyboard is optional
        .then((sentMsg) => {
          handleReplyMessage(sentMsg.message_id, cb);
        });
    };
    handleFlow(promptsList);
  });

module.exports = {
  callBackKeys,
  handleButtons,
  messageReplyPairs,
  handleReplyMessage,
  handleReplyFlow,
  checkIfMainGroup,
  getKeyboardOptions,
};
