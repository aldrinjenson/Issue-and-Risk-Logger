const mongoose = require("mongoose");
const { Schema } = mongoose;

const MainGroupSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    snippet: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const MainGroup = mongoose.model("MainGroup", MainGroupSchema);
module.exports = MainGroup;
