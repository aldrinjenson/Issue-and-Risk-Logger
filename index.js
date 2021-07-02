/* eslint-disable camelcase */
require("dotenv").config();
const mongoose = require("mongoose");
process.env.NTBA_FIX_319 = 1;
const TelegramBot = require("node-telegram-bot-api");
const http = require("http");
const { handleButtons, callBackKeys } = require("./utils");

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
console.log("Up and running..");
const helpMessage = "Help is on it's way. :)";

// mongoose
//   .connect(process.env.DB_URL, {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("Connected to db"))
//   .catch((err) => console.log("error in connecting to db" + err));

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

bot.onText(/\/register/, (msg) => {
  const chatId = msg.chat.id;
  const keyboardOptions = handleButtons([
    {
      text: "Register as main group",
      callback: () => {
        console.log("helo there");
      },
    },
    {
      text: "Register as sub group",
      callback: () => {
        console.log("helo there from second");
      },
    },
  ]);

  bot.sendMessage(chatId, "Choose group type", keyboardOptions);
});

bot.on("callback_query", (callbackQuery) => {
  const action = callbackQuery.data;
  const { message: msg } = callbackQuery;
  const opts = {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
  };
  if (msg.chat.type === "private") {
    bot.editMessageText(
      "Please use commands from a group.\nHere's the help command\n" +
        helpMessage,
      opts
    );
    return;
  }

  Object.entries(callBackKeys)?.forEach(([key, val]) => {
    console.log(key, val);
    if (action === key) {
      val();
    }
  });
});

module.exports = { bot };
