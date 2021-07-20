// script to update the status of all issues as open
const mongoose = require("mongoose");
require("dotenv").config();
const { Issue } = require("../models");

const main = async () => {
  Issue.updateMany({}, { isOpen: true })
    .then((res) => {
      console.log("Number of files modified = ", res.nModified);
      process.exit(0);
    })
    .catch((err) => {
      console.log("error in updating" + err);
      process.exit(1);
    });
};

mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to db");
    main();
  })
  .catch((err) => console.log("error in connecting to db" + err));
