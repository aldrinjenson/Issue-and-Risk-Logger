/* eslint-disable no-inline-comments */
/* eslint-disable line-comment-position */
/* eslint-disable camelcase */
require("dotenv").config();
const mongoose = require("mongoose");
process.env.NTBA_FIX_319 = 1;
const TelegramBot = require("node-telegram-bot-api");
const http = require("http");
const {
  handleButtons,
  callBackKeys,
  handleIsFromPrivateMessage,
  messageReplyPairs,
} = require("./utils");
const {
  registerAsMainGroup,
  registerAsSubGroup,
} = require("./controller/registerController");
const { addNewIssue } = require("./controller/issueController");

////////////////// fix for heroku hosting - start//////////////////
const requestListener = function (req, res) {
  res.writeHead(200);
  res.end("Bot active\nCurrent Time: " + new Date());
};
const server = http.createServer(requestListener);
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log("server listening"));
////////////////// fix for heroku hosting - end//////////////////

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
bot.on("polling_error", console.log);
const helpMessage = "Help is on it's way. :)";
let db = null; // connect db
if (!db) {
  db = mongoose
    .connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to db"))
    .catch((err) => console.log("error in connecting to db" + err));
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const resp =
    "This is an issue and task logger bot.\nEnter /help to see more information";
  bot.sendMessage(chatId, resp);
});
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, helpMessage);
});

bot.onText(/\/register$/, async (msg) => {
  if (await handleIsFromPrivateMessage(msg, bot)) {
    return;
  }
  const chatId = msg.chat.id;
  const keyboardOptions = handleButtons([
    {
      text: "Register as main group",
      callback: registerAsMainGroup,
    },
    {
      text: "Register as sub group",
      callback: registerAsSubGroup,
    },
  ]);
  bot.sendMessage(chatId, "Choose group type", keyboardOptions);
});

bot.onText(/\/issue$/, async (msg) => {
  if (await handleIsFromPrivateMessage(msg, bot)) {
    return;
  }
  const chatId = msg.chat.id;
  const keyboardOptions = handleButtons([
    {
      text: "Add new issue",
      callback: addNewIssue,
    },
    {
      text: "List all issues",
      callback: registerAsSubGroup,
    },
    {
      text: "Update issue",
      callback: registerAsSubGroup,
    },
  ]);
  bot.sendMessage(chatId, "Issue options:", keyboardOptions);
});

bot.on("callback_query", async (callbackQuery) => {
  const { data: action, message: msg } = callbackQuery;
  if (await handleIsFromPrivateMessage(msg, bot)) {
    return;
  }

  Object.entries(callBackKeys)?.forEach(([key, val]) => {
    if (action === key) {
      val(callbackQuery, bot);
    }
  });
});

bot.on("message", (msg) => {
  const replyToId = msg.reply_to_message;
  if (replyToId) {
    Object.entries(messageReplyPairs)?.forEach(([key, val]) => {
      if (replyToId.message_id == key) {
        val(msg, bot);
        // delete messageReplyPairs[key]; // removing the past message once it's replied to in order to save memory
      }
    });
  }
});

module.exports = { bot };
