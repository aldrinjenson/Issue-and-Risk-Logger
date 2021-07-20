const mongoose = require("mongoose");
const { Schema } = mongoose;

const ActionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
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
    assignee: {
      type: String,
      required: false,
    },
    criticalDate: {
      type: Date,
      required: false,
    },
    isOpen: {
      type: Boolean,
      required: true,
    },
    recordId: {
      type: String,
      required: true,
    },
    impact: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Action = mongoose.model("Action", ActionSchema);
module.exports = Action;
