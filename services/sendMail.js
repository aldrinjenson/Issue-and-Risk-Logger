const nodemailer = require("nodemailer");

const sendMail = async (reportBuffer, emailId) => {
  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  const groupName = "Main Group AB";

  console.log({ emailId, reportBuffer });

  let info = await transporter.sendMail({
    from: "test@test.com", // sender address
    to: "aldrinjenson@gmail.com", // list of receivers
    subject: `Daily Backup - ${groupName}`, // Subject line
    text: `Daily Backup of ${groupName} \nSent from Issue and Risk Logger Bot`, // plain text body
    attachments: [
      {
        filename: `Backup - ${new Date().toDateString()}, ${groupName}.xlsx`,
        content: reportBuffer,
        // path: "./report.xlsx",
      },
    ],
  });

  console.log("Message sent: %s", info.messageId);

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
};

module.exports = { sendMail };
