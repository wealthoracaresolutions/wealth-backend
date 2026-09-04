require("dotenv").config();
const { sendGmailMail } = require("./gmailOAuth");

const transporter = {
  async sendMail(options) {
    return sendGmailMail({
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  },
};

const setMailOptions = (to, html, subject = "Info from HealthSupport!") => ({
  from: `"HealthSupport" <${process.env.gmail_user || "medicalhealthassets@gmail.com"}>`,
  to,
  subject,
  html,
});

const sendEmail = async (to, html, subject = "Info from HealthSupport!") => {
  try {
    const mailOptions = setMailOptions(to, html, subject);
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = { transporter, setMailOptions, sendEmail };