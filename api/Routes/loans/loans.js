const express = require("express");
const loanModel = require("../../models/loanModel.js");
const userModel = require("../../models/userModel.js");
const createCustomError = require("../../createCustomError.js");
const { verify, verifyAdmin } = require("../user/verify.js");
const { sendEmail } = require("../../../emailconfig.js");
const getEmailTemplate = require("../../../createEmailtemplate.js");

const sendLoanApplicantEmail = async (loanId, { subject, message }) => {
  const loan = await loanModel.findById(loanId).populate("userId", "name email");

  if (!loan) {
    throw new Error("Loan not found");
  }

  const user = loan.userId;
  if (!user || !user.email) {
    throw new Error("Applicant email not found");
  }

  const emailHtml = getEmailTemplate(user.name || "Applicant", message || "This is an important update from HealthSupport.", false);
  return sendEmail(user.email, emailHtml, subject || "Loan update from HealthSupport");
};

// Apply for a new loan
const applyForLoan = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      loanAmount,
      repaymentPeriod,
      applicant,
      bankDetails,
      walletAddress,
    } = req.body;

    if (
      !loanAmount ||
      !repaymentPeriod ||
      !applicant ||
      !applicant.phoneNumber ||
      !applicant.idType ||
      !applicant.idImageUrl ||
      !applicant.utilityBillImageUrl
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required applicant fields",
      });
    }

    const hasBankDetails =
      bankDetails &&
      bankDetails.bankName &&
      bankDetails.accountNumber &&
      bankDetails.accountHolderName;

    const hasWalletDetails =
      walletAddress && walletAddress.coinType && walletAddress.address;

    if (!hasBankDetails && !hasWalletDetails) {
      return res.status(400).json({
        success: false,
        message: "Please provide either bank details or crypto wallet details",
      });
    }

    if (hasBankDetails && hasWalletDetails) {
      return res.status(400).json({
        success: false,
        message: "Provide either bank details or crypto wallet details, not both",
      });
    }

    if (bankDetails && !hasBankDetails) {
      return res.status(400).json({
        success: false,
        message: "Bank details are incomplete",
      });
    }

    if (walletAddress && !hasWalletDetails) {
      return res.status(400).json({
        success: false,
        message: "Crypto wallet details are incomplete",
      });
    }

    // Calculate loan terms
    const interestRate = 5; // 5% per annum
    const monthlyRate = interestRate / 100 / 12;
    const monthlyPayment =
      (loanAmount *
        (monthlyRate * Math.pow(1 + monthlyRate, repaymentPeriod))) /
      (Math.pow(1 + monthlyRate, repaymentPeriod) - 1);
    const totalRepaymentAmount = monthlyPayment * repaymentPeriod;

    const newLoan = await loanModel.create({
      userId,
      loanAmount,
      repaymentPeriod,
      interestRate,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalRepaymentAmount: Math.round(totalRepaymentAmount * 100) / 100,
      applicant,
      bankDetails,
      walletAddress: walletAddress || null,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Loan application submitted successfully",
      result: newLoan,
    });
  } catch (err) {
    console.log(err.message);
    next(createCustomError(err.message));
  }
};

// Get user's loan applications
const getUserLoans = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const loans = await loanModel.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      result: loans,
    });
  } catch (err) {
    console.log(err.message);
    next(createCustomError(err.message));
  }
};

// Get single loan details
const getLoanDetails = async (req, res, next) => {
  try {
    const { loanId } = req.params;
    const loan = await loanModel
      .findById(loanId)
      .populate("userId", "name email phone");

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: "Loan not found",
      });
    }

    res.status(200).json({
      success: true,
      result: loan,
    });
  } catch (err) {
    console.log(err.message);
    next(createCustomError(err.message));
  }
};

// Admin: Get all loan applications
const getAllLoans = async (req, res, next) => {
  try {
    const loans = await loanModel
      .find()
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      result: loans,
    });
  } catch (err) {
    console.log(err.message);
    next(createCustomError(err.message));
  }
};

// Admin: Get loans by status
const getLoansByStatus = async (req, res, next) => {
  try {
    const { status } = req.params;

    const validStatuses = [
      "pending",
      "approved",
      "rejected",
      "disbursed",
      "repaid",
      "defaulted",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const loans = await loanModel
      .find({ status })
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      result: loans,
    });
  } catch (err) {
    console.log(err.message);
    next(createCustomError(err.message));
  }
};

// Admin: Approve loan application
const approveLoan = async (req, res, next) => {
  try {
    const { loanId } = req.params;
    const { comments, creditScore, disbursalMethod } = req.body;

    if (!["bank_transfer", "wallet_transfer", "cash"].includes(disbursalMethod)) {
      return res.status(400).json({
        success: false,
        message: "Admin must select a valid disbursal method",
      });
    }

    const loan = await loanModel.findById(loanId);
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: "Loan not found",
      });
    }

    if (loan.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Loan can only be approved from pending status",
      });
    }

    const updatedLoan = await loanModel.findByIdAndUpdate(
      loanId,
      {
        status: "approved",
        "adminReview.reviewDate": new Date(),
        "adminReview.reviewedBy": req.user.id,
        "adminReview.comments": comments,
        "adminReview.creditScore": creditScore,
        "disbursalDetails.disbursalDate": new Date(),
        "disbursalDetails.disbursalMethod": disbursalMethod,
      },
      { new: true }
    );

    const applicantNotice = comments || "Your loan application has been approved. We will continue with the next steps shortly.";
    await sendLoanApplicantEmail(loanId, {
      subject: "Your loan application has been approved",
      message: applicantNotice,
    });

    res.status(200).json({
      success: true,
      message: "Loan approved successfully",
      result: updatedLoan,
    });
  } catch (err) {
    console.log(err.message);
    next(createCustomError(err.message));
  }
};

// Admin: Reject loan application
const rejectLoan = async (req, res, next) => {
  try {
    const { loanId } = req.params;
    const { comments } = req.body;

    const loan = await loanModel.findById(loanId);
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: "Loan not found",
      });
    }

    if (loan.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Loan can only be rejected from pending status",
      });
    }

    const updatedLoan = await loanModel.findByIdAndUpdate(
      loanId,
      {
        status: "rejected",
        "adminReview.reviewDate": new Date(),
        "adminReview.reviewedBy": req.user.id,
        "adminReview.comments": comments,
      },
      { new: true }
    );

    const rejectionNotice = comments || "Your loan application was not approved at this time. Please contact our support team for more information.";
    await sendLoanApplicantEmail(loanId, {
      subject: "Update on your loan application",
      message: rejectionNotice,
    });

    res.status(200).json({
      success: true,
      message: "Loan rejected",
      result: updatedLoan,
    });
  } catch (err) {
    console.log(err.message);
    next(createCustomError(err.message));
  }
};

// Admin: Disburse loan
const disburseLoan = async (req, res, next) => {
  try {
    const { loanId } = req.params;
    const { transactionId } = req.body;

    const loan = await loanModel.findById(loanId);
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: "Loan not found",
      });
    }

    if (loan.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Only approved loans can be disbursed",
      });
    }

    const updatedLoan = await loanModel.findByIdAndUpdate(
      loanId,
      {
        status: "disbursed",
        "disbursalDetails.transactionId": transactionId,
        "repaymentDetails.remainingBalance": loan.totalRepaymentAmount,
        "repaymentDetails.nextPaymentDue": new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ), // 30 days from now
      },
      { new: true }
    );

    // Add loan amount to user's balance
    await userModel.findByIdAndUpdate(loan.userId, {
      $inc: { balance: loan.loanAmount },
    });

    const disbursementMessage = `Your loan has been disbursed successfully. The approved amount of $${loan.loanAmount.toLocaleString()} is now available and the transaction reference is ${transactionId || "N/A"}.`;
    await sendLoanApplicantEmail(loanId, {
      subject: "Your loan has been disbursed",
      message: disbursementMessage,
    });

    res.status(200).json({
      success: true,
      message: "Loan disbursed successfully",
      result: updatedLoan,
    });
  } catch (err) {
    console.log(err.message);
    next(createCustomError(err.message));
  }
};

// User: Make loan payment
const makeLoanPayment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { loanId, amountPaid, paymentMethod, transactionId, bankDetails } = req.body;

    if (!paymentMethod || !["bank", "crypto", "cash"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Select either bank, crypto, or cash as the payment method",
      });
    }
    if (paymentMethod === "bank" && !bankDetails?.bankName) {
      return res.status(400).json({
        success: false,
        message: "Bank name is required for bank payments",
      });
    }

    const loan = await loanModel.findById(loanId);
    if (!loan) {
      return res.status(404).json({
        success: false,
        message: "Loan not found",
      });
    }

    if (loan.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (loan.status !== "disbursed") {
      return res.status(400).json({
        success: false,
        message: "Loan is not in disbursed status",
      });
    }

    const newRemainingBalance =
      loan.repaymentDetails.remainingBalance - amountPaid;
    const isLoanRepaid = newRemainingBalance <= 0;

    const updatedLoan = await loanModel.findByIdAndUpdate(
      loanId,
      {
        $set: {
          "repaymentDetails.amountRepaid":
            loan.repaymentDetails.amountRepaid + amountPaid,
          "repaymentDetails.remainingBalance": Math.max(newRemainingBalance, 0),
          status: isLoanRepaid ? "repaid" : "disbursed",
          "repaymentDetails.nextPaymentDue": !isLoanRepaid
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            : null,
        },
        $push: {
          "repaymentDetails.paymentHistory": {
            paymentDate: new Date(),
            amountPaid,
            paymentMethod,
            transactionId,
            bankName: paymentMethod === "bank" ? bankDetails.bankName : undefined,
          },
        },
      },
      { new: true }
    );

    // Deduct from user balance
    await userModel.findByIdAndUpdate(userId, {
      $inc: { balance: -amountPaid },
    });

    res.status(200).json({
      success: true,
      message: "Payment recorded successfully",
      result: updatedLoan,
    });
  } catch (err) {
    console.log(err.message);
    next(createCustomError(err.message));
  }
};

// Get loan statistics
const getLoanStats = async (req, res, next) => {
  try {
    const totalLoans = await loanModel.countDocuments();
    const pendingLoans = await loanModel.countDocuments({ status: "pending" });
    const approvedLoans = await loanModel.countDocuments({ status: "approved" });
    const disbursedLoans = await loanModel.countDocuments({
      status: "disbursed",
    });
    const repaidLoans = await loanModel.countDocuments({ status: "repaid" });

    const totalLoanAmount = await loanModel.aggregate([
      { $group: { _id: null, total: { $sum: "$loanAmount" } } },
    ]);

    res.status(200).json({
      success: true,
      result: {
        totalLoans,
        pendingLoans,
        approvedLoans,
        disbursedLoans,
        repaidLoans,
        totalLoanAmount: totalLoanAmount[0]?.total || 0,
      },
    });
  } catch (err) {
    console.log(err.message);
    next(createCustomError(err.message));
  }
};

const sendApplicantEmail = async (req, res, next) => {
  try {
    const { loanId } = req.params;
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Subject and message are required",
      });
    }

    await sendLoanApplicantEmail(loanId, { subject, message });

    return res.status(200).json({
      success: true,
      message: "Loan applicant email sent successfully",
    });
  } catch (error) {
    console.log(error.message);
    next(createCustomError(error.message));
  }
};

module.exports = {
  applyForLoan,
  getUserLoans,
  getLoanDetails,
  getAllLoans,
  getLoansByStatus,
  approveLoan,
  rejectLoan,
  disburseLoan,
  makeLoanPayment,
  getLoanStats,
  sendApplicantEmail,
  sendLoanApplicantEmail,
};
