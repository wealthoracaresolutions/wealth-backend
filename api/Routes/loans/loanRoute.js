const { Router } = require("express");
const {
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
} = require("./loans.js");
const { verify, verifyAdmin } = require("../user/verify.js");

const loanRouter = Router();

// User routes
loanRouter.post("/apply", verify, applyForLoan);
loanRouter.get("/my-loans", verify, getUserLoans);
loanRouter.get("/details/:loanId", verify, getLoanDetails);
loanRouter.post("/payment/:loanId", verify, makeLoanPayment);

// Admin routes
loanRouter.get("/admin/all", verifyAdmin, getAllLoans);
loanRouter.get("/admin/status/:status", verifyAdmin, getLoansByStatus);
loanRouter.post("/admin/approve/:loanId", verifyAdmin, approveLoan);
loanRouter.post("/admin/reject/:loanId", verifyAdmin, rejectLoan);
loanRouter.post("/admin/disburse/:loanId", verifyAdmin, disburseLoan);
loanRouter.get("/admin/stats", verifyAdmin, getLoanStats);

module.exports = loanRouter;
