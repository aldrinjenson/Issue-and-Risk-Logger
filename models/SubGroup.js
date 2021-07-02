const mongoose = require("mongoose");
const { Schema } = mongoose;

const SubGroupSchema = new Schema(
  {
    registeredBy: {
      type: String,
      required: true,
    },
    registeredDate: {
      type: Number,
      required: true,
    },
    mainGroupId: {
      type: String,
      required: true,
    },
    groupId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const SubGroup = mongoose.model("SubGroup", SubGroupSchema);
module.exports = { SubGroup };
