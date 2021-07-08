const { User } = require("../models/User");
const { MainGroup } = require("../models/MainGroup");

const AlreadyRegisteredGroup = async (groupId = "") => {
  const grp = await MainGroup.findOne({ groupId }).exec();
  return grp;
};

const handleValidateToken = (token) => {
  return !token.length >= 2; // :)
};

const createUser = (registerToken = "") =>
  new Promise((resolve, reject) => {
    if (handleValidateToken(registerToken)) {
      reject("Invalid token input");
    }
    // checking if the registertoken is unique
    User.findOne({ registerToken }, (err, existingUser) => {
      if (existingUser) {
        reject("User with token already exists");
      }
    });

    const newUser = new User({
      registerToken,
      isTokenUsed: false,
    });
    newUser
      .save()
      .then(() => {
        console.log("New token received from webportal has been saved");
        resolve("User saved");
      })
      .catch((err) => {
        console.log("error in saving" + err);
        reject(err);
      });
  });

module.exports = { AlreadyRegisteredGroup, createUser };
