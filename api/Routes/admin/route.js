const {
    editCoin,
    verifyAdmin,
    getStats,
    
    approveWithdrawal,
    declineWithdrawal,
    approveDeposit,
    declineInvestment,
  } = require("./adminRoute.js");
  
  const {Router}= require("express")
  const adminRoute= Router()
  adminRoute.get("/getstats",  getStats)
  adminRoute.post("/editcoin",  verifyAdmin, editCoin)
  adminRoute.post("/approvewithdrawal/:id",  verifyAdmin, approveWithdrawal)
  adminRoute.post("/approvedeposit/:id",  verifyAdmin, approveDeposit)
  adminRoute.post("/declinedeposit/:id",  verifyAdmin, declineInvestment)
  adminRoute.post("/declinewithdrawal/:id",  verifyAdmin, declineWithdrawal)



  module.exports = adminRoute