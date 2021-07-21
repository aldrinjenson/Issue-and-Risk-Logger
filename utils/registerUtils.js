const { User } = require("../models");

const handleValidateToken = (token) => {
  // proper strong validation can be added here once front-end has been fully set
  return typeof token === "string" && token.length >= 2; // :)
};

const createUser = async (registerToken = "") => {
  if (!handleValidateToken(registerToken)) {
    return { msg: "Token failed validation", err: 1 };
  }

  const existingUser = await User.findOne({ registerToken }).exec();
  if (existingUser) {
    return { msg: "User with token already exists", err: 1 };
  }

  const newUser = new User({
    registerToken,
    isTokenUsed: false,
  });
  try {
    await newUser.save();
    console.log("New token received from webportal has been saved");
    return { msg: "User saved", err: 0 };
  } catch (err) {
    console.log("error in saving user: " + err);
    return { msg: err, err: 1 };
  }
};
module.exports = { createUser };
