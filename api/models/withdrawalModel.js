const mongoose = require("mongoose");
const {Schema}= mongoose
const withdrawalSchema = mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref:"users",
      required: true,
    },
    approvedDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "pending",
    },
    wallet: {
      coin: {
        type: String,
      },
      walletId: {
        type: String,
      },
       
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("withdrawals",withdrawalSchema);
