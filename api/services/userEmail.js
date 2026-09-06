const userModel = require("../models/userModel");
const { sendEmail } = require("../../emailconfig");
const getEmailTemplate = require("../../createEmailtemplate");

const sendUserNotification = async (userId, { subject, message }) => {
  const user = await userModel.findById(userId).select("name email");

  if (!user || !user.email) {
    throw new Error("Recipient email not found");
  }

  const emailHtml = getEmailTemplate(
    user.name || "Client",
    message || "Your transaction has been approved.",
    false
  );

  return sendEmail(user.email, emailHtml, subject);
};

module.exports = { sendUserNotification };
