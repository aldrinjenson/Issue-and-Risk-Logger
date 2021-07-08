const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    registerToken: {
      type: String,
      required: true,
    },
    isTokenUsed: {
      type: Boolean,
      required: true,
    },
    userId: {
      type: String,
      required: false,
    },
    userName: {
      type: String,
      required: false,
    },
    connectedMainGroup: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
module.exports = { User };
