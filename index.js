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
  isMainGroup,
} = require("./utils/common");
const {
  registerAsMainGroup,
  registerAsSubGroup,
} = require("./controller/registerController");
const {
  addNewIssue,
  listIssues,
  updateIssue,
  listFilteredIssues,
} = require("./controller/issueController");

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
const helpMessage = `This is a bot to manage the issue and risk logging among multiple groups.
Register the bot as 'main' with the /register command in the primary group and then pair sub groups using the join token received
Add issues or tasks using the /issue and /task options.
All the updates made in the subgroups will be notified instantly in the main group as well`;

mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to db"))
  .catch((err) => console.log("error in connecting to db" + err));

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

bot.onText(/\/register/, async (msg) => {
  if (await handleIsFromPrivateMessage(msg, bot)) {
    return;
  }
  const chatId = msg.chat.id;
  const keyboardOptions = handleButtons([
    {
      text: "Register as main group",
      onPress: registerAsMainGroup,
    },
    {
      text: "Register as sub group",
      onPress: registerAsSubGroup,
    },
  ]);
  bot.sendMessage(chatId, "Choose group type", keyboardOptions);
});

bot.onText(/\/issue/, async (msg) => {
  if (await handleIsFromPrivateMessage(msg, bot)) {
    return;
  }
  const { id: groupId } = msg.chat;
  const isSubGroup = !(await isMainGroup(groupId));
  const chatId = msg.chat.id;

  // show filtered issues in parent group

  const buttons = isSubGroup
    ? [
        {
          text: "Add new Issue",
          onPress: addNewIssue,
        },
        {
          text: "List issues",
          onPress: listIssues,
        },
        {
          text: "Update issue",
          onPress: updateIssue,
        },
      ]
    : [
        {
          text: "List issues",
          onPress: listIssues,
        },
        {
          text: "Filtered issue",
          onPress: listFilteredIssues,
        },
      ];

  const keyboardOptions = handleButtons(buttons);
  bot.sendMessage(chatId, "Choose option:", keyboardOptions);
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
        delete messageReplyPairs[key]; // removing the past message once it's replied to in order to save memory
      }
    });
  }
});

module.exports = { bot };
