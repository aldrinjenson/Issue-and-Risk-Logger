const mongoose = require("mongoose");
const { Schema } = mongoose;

const IssueSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    addedBy: {
      type: String,
      required: true,
    },
    addedDate: {
      type: String,
      required: true,
    },
    addedGroupName: {
      type: String,
      required: true,
    },
    mainGroupId: {
      type: String,
      required: true,
    },
    addedGroupId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Issue = mongoose.model("Issue", IssueSchema);
module.exports = { Issue };
