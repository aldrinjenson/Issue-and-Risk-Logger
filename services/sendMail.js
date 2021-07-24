const nodemailer = require("nodemailer");

const sendMail = async (reportBuffer, group) => {
  const { backupEmailId: groupBackupEmailId, groupName } = group;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.BB_EMAIL,
      pass: process.env.BB_PASS,
    },
  });

  console.log({ groupBackupEmailId, reportBuffer });
  const dt = new Date().toDateString();

  await transporter.sendMail({
    from: process.env.BB_EMAIL,
    to: groupBackupEmailId, // list of receivers
    subject: `Daily Backup - ${groupName}`, // Subject line
    text: `Daily Backup of ${groupName} for ${dt}\n-Sent from Issue and Risk Logger Bot`, // plain text body
    attachments: [
      {
        filename: `Backup - ${dt}, ${groupName}.xlsx`,
        content: reportBuffer,
      },
    ],
  });

  console.log(`Mail sent to ${groupBackupEmailId} for group: ${groupName}`);
};

module.exports = { sendMail };
