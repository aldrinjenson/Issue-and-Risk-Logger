const mongoose = require("mongoose");
const { Schema } = mongoose;

const MainGroupSchema = new Schema(
  {
    registeredBy: {
      type: String,
      required: true,
    },
    registeredDate: {
      type: Number,
      required: true,
    },
    subGroupIds: {
      type: [String],
      required: true,
    },
    groupId: {
      type: String,
      required: true,
    },
    joinToken: {
      type: String,
      required: true,
    },
    groupName: {
      type: String,
      required: false,
    },
    backupEmailId: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

const MainGroup = mongoose.model("MainGroup", MainGroupSchema);
module.exports = MainGroup;
