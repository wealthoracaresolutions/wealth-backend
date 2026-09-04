const Mongoose = require("mongoose");

const gmailTokenSchema = new Mongoose.Schema(
  {
    provider: {
      type: String,
      default: "gmail",
      unique: true,
    },
    refreshToken: {
      type: String,
      default: "",
    },
    accessToken: {
      type: String,
      default: "",
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    tokenType: {
      type: String,
      default: "Bearer",
    },
  },
  { timestamps: true }
);

module.exports = Mongoose.model("gmailTokens", gmailTokenSchema);
