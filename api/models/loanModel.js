const Mongoose = require("mongoose");
const { Schema } = Mongoose;

const LoanModel = new Mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "disbursed", "repaid", "defaulted"],
    default: "pending",
  },
  loanAmount: {
    type: Number,
    required: true,
    min: 100,
    max: 1000000,
  },
  interestRate: {
    type: Number,
    default: 5, // percentage
  },
  totalRepaymentAmount: {
    type: Number,
    required: true,
  },
  repaymentPeriod: {
    type: Number, // in months
    required: true,
  },
  monthlyPayment: {
    type: Number,
    required: true,
  },
  applicant: {
    phoneNumber: {
      type: String,
      required: true,
    },
    idType: {
      type: String,
      enum: ["national_id", "passport", "driving_license"],
      required: true,
    },
    idImageUrl: {
      type: String,
      required: true,
    },
    utilityBillImageUrl: {
      type: String,
      required: true,
    },
  },
  bankDetails: {
    bankName: {
      type: String,
    },
    accountNumber: {
      type: String,
    },
    accountHolderName: {
      type: String,
    },
    swiftCode: {
      type: String,
    },
  },
  walletAddress: {
    coinType: {
      type: String,
      enum: ["ethereum", "bitcoin", "usdt", "dogecoin"],
    },
    address: {
      type: String,
    },
  },
  disbursalDetails: {
    disbursalDate: {
      type: Date,
    },
    disbursalMethod: {
      type: String,
      enum: ["bank_transfer", "wallet_transfer", "cash"],
    },
    transactionId: {
      type: String,
    },
  },
  repaymentDetails: {
    amountRepaid: {
      type: Number,
      default: 0,
    },
    remainingBalance: {
      type: Number,
    },
    nextPaymentDue: {
      type: Date,
    },
    paymentHistory: [
      {
        paymentDate: Date,
        amountPaid: Number,
        paymentMethod: String,
        transactionId: String,
        bankName: String,
      },
    ],
  },
  adminReview: {
    reviewDate: Date,
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    comments: String,
    creditScore: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Mongoose.model("loans", LoanModel);
