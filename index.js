require("dotenv").config();
const mongoose = require("mongoose");
process.env.NTBA_FIX_319 = 1;
const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
// const http = require("http");
const {
  handleButtons,
  callBackKeys,
  messageReplyPairs,
  checkIfMainGroup,
} = require("./utils/common");
const {
  registerAsMainGroup,
  registerAsSubGroup,
} = require("./controller/registerController");
const {
  addNewEntity,
  listRecords,
  updateRecords,
  listFilteredRecords,
} = require("./controller/entityController");
const { handleIsFromPrivateMessage } = require("./utils/groupUtils");
const { entities } = require("./constants");
const { createUser } = require("./utils/registerUtils");

////////////////// fix for heroku hosting - start//////////////////
// To remove CROS (cross-resource-origin-platform) problem
const app = express();
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // to allow all client we use *
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS,GET,POST,PUT,PATCH,DELETE"
  ); //these are the allowed methods
  res.setHeader("Access-Control-Allow-Headers", "*"); // allowed headers (Auth for extra data related to authoriaztiom)
  next();
});

app.use(express.json());
app.get("/", (req, res) => {
  res.send("Bot active\nCurrent Time: " + new Date());
});
app.post("/registerToken", (req, res) => {
  const token = req.body.token;
  createUser(token)
    .then((msg) => {
      res.send({ msg, err: 0 });
    })
    .catch((errMsg) => res.send({ msg: errMsg, err: 1 }));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server listening"));
////////////////// fix for heroku hosting - end//////////////////

let bot = null;
bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
bot.on("polling_error", console.log);
const helpMessage = `This is a bot to manage the issue and risk logging among multiple groups.
Register the bot as 'main' with the /register command in the primary group and then pair sub groups using the join token received
Add issues or risks using the /issue and /risk options.
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
    "This is an issue and risk logger bot.\nEnter /help to see more information";
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
  const groupId = msg.chat.id;
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
  bot.sendMessage(groupId, "Choose group type", keyboardOptions);
});

bot.onText(/\/issue|\/risk|\/action/, async (msg, match) => {
  if (await handleIsFromPrivateMessage(msg, bot)) {
    return;
  }
  const command = match[0].slice(1);
  const entity = entities[command];
  const { id: groupId } = msg.chat;
  const isMainGroup = await checkIfMainGroup(groupId);

  if (isMainGroup && !entity.shouldShowInMainGroup) {
    bot.sendMessage(
      groupId,
      `${entity.name}s are available only in subgroups :)`
    );
    return;
  }

  const buttons = isMainGroup
    ? [
        {
          text: `List ${entity.name}s`,
          onPress: (cbQuery, bot) => listRecords(cbQuery, bot, entity),
        },
        {
          text: `Filtered ${entity.name}s`,
          onPress: (cbQuery, bot) => listFilteredRecords(cbQuery, bot, entity),
        },
      ]
    : [
        {
          text: `Add new ${entity.name}`,
          onPress: (cbQuery, bot) => addNewEntity(cbQuery, bot, entity),
        },
        {
          text: `List ${entity.name}s`,
          onPress: (cbQuery, bot) => listRecords(cbQuery, bot, entity),
        },
        {
          text: `Update ${entity.name}`,
          onPress: (cbQuery, bot) => updateRecords(cbQuery, bot, entity),
        },
      ];

  const keyboardOptions = handleButtons(buttons);
  bot.sendMessage(groupId, "Choose option:", keyboardOptions);
});

// for handling inline button presses
bot.on("callback_query", async (callbackQuery) => {
  const { data: selectedVal, message: msg } = callbackQuery;
  if (msg.chat.type === "private") {
    return;
  }

  Object.entries(callBackKeys)?.forEach(([key, val]) => {
    if (selectedVal === key) {
      val(callbackQuery, bot);
      // delete callBackKeys[key];
    }
  });
});

// for handling replies to bot messages
bot.on("message", (msg) => {
  const replyToId = msg.reply_to_message;
  if (replyToId) {
    Object.entries(messageReplyPairs)?.forEach(([key, val]) => {
      if (replyToId.message_id == key) {
        val(msg, bot);
        delete messageReplyPairs[key]; // release from memory
      }
    });
  }
});

module.exports = { bot };
