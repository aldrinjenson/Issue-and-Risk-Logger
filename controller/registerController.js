const short = require("short-uuid");
const { MainGroup, SubGroup, User } = require("../models");
const { handleReplyMessage, handleReplyFlow } = require("../utils/common");
const { generateGroupCode } = require("../utils/groupUtils");

const registerAsMainGroup = async (data, bot) => {
  const { message, from } = data;
  const { title, id: groupId } = message.chat;
  const registeredGroup = await MainGroup.findOne({ groupId }).exec();

  // if already registered as main group
  if (registeredGroup) {
    bot.sendMessage(
      groupId,
      "Aleady registerd as main group\nUse the following token to register sub groups:\n"
    );
    bot.sendMessage(groupId, registeredGroup.joinToken);
    return;
  }

  // receive registerToken from user
  const { registerToken } = await handleReplyFlow(
    [
      {
        key: "registerToken",
        prompt: "Please enter the register token as a reply to this message",
      },
    ],
    groupId,
    bot
  );

  // check if a user with the registerToken exists in db
  const existingUser = await User.findOne({ registerToken }).exec();
  if (!existingUser) {
    bot.sendMessage(groupId, "Invalid token entered. Please verify");
    return;
  }
  if (existingUser.isTokenUsed) {
    bot.sendMessage(
      groupId,
      "This token has already been used to register a main group"
    );
    return;
  }

  const emailRegex = "[^@ \t\r\n]+@[^@ \t\r\n]+.[^@ \t\r\n]+";
  const { emailId } = await handleReplyFlow(
    [
      {
        key: "emailId",
        prompt: "Enter your email to get daily backup report of all records",
        condition: (email) => email.match(emailRegex),
      },
    ],
    groupId,
    bot
  );

  const joinToken = short.generate();

  const newMainGroup = new MainGroup({
    registeredBy: from.username,
    registeredDate: message.date,
    subGroupIds: [],
    groupName: title,
    groupId,
    joinToken,
    backupEmailId: emailId,
  });

  try {
    const savedMainGroup = await newMainGroup.save();
    await bot.sendMessage(
      groupId,
      `"${message.chat.title}" registered as main group\nRegister sub groups using the following token:`
    );
    bot.sendMessage(groupId, joinToken);

    existingUser.isTokenUsed = true;
    existingUser.userId = from.id;
    existingUser.userName = from.username;
    existingUser.connectedMainGroup = savedMainGroup._id;

    await existingUser.save();
    console.log(`Token: ${registerToken} has been used to register main group`);
  } catch (err) {
    bot.sendMessage(
      groupId,
      "There seems to be some error in registration. Please verify your details and try again"
    );
    console.log("Error in registration: " + err);
  }
};

const handleTokenVerifyAndRegisterSubgroup = (msg, bot) => {
  const token = msg.text;
  const groupId = msg.chat.id;
  MainGroup.findOne({ joinToken: token }, async (err, mainGrp) => {
    if (err) {
      console.log("err " + err);
      return;
    } else if (!mainGrp) {
      bot.sendMessage(
        msg.chat.id,
        "Invalid token. Please verify and try again"
      );
      return;
    }
    const groupName = msg.chat.title;
    const groupCode = await generateGroupCode(mainGrp.groupId, groupName);

    mainGrp.subGroupIds = [...mainGrp.subGroupIds, groupId];
    mainGrp.save().then(async (doc) => {
      const newSubGroup = new SubGroup({
        registeredBy: msg.from.username,
        registeredDate: msg.date,
        mainGroupId: mainGrp.groupId,
        groupId,
        groupName,
        groupCode,
      });
      await newSubGroup.save();

      bot.sendMessage(
        msg.chat.id,
        `Connected to main group: "${mainGrp.groupName}"`
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
  const { message_id } = message;
  bot.editMessageText("Enter join token as a reply to this message", {
    chat_id: groupId,
    message_id: message_id,
  });
  handleReplyMessage(message_id, handleTokenVerifyAndRegisterSubgroup);
};

module.exports = { registerAsMainGroup, registerAsSubGroup };
