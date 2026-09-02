const {Router}= require("express")
const  { verifyAdmin } = require("./verify.js"); 
const {
    login,
    loginWithToken,
    register,
    getCoins,
    getTotalStat,
    addWallet,
    verify,
    recoverAccount,
    resetPassword,
    promoteUser,
    demoteUser,
    deleteUser,
    getSingleUser,
    sendMessage,
    approveUser,
    creditUser,
    editUserBalance,
  } = require("./controllers.js");
  
  

const userRouter= Router()

userRouter.post("/register", register)
userRouter.post("/login",login )
userRouter.post("/tklogin",verify, loginWithToken)
userRouter.get("/getcoins", getCoins)
userRouter.post("/getstats", verify, getTotalStat)
userRouter.post("/addwallet", verify, addWallet)
userRouter.post("/forgotpassword", recoverAccount)
userRouter.post("/resetpassword", resetPassword)
userRouter.post("/promoteuser/:id",verifyAdmin, promoteUser)
userRouter.post("/demoteuser/:id",verifyAdmin, demoteUser)
userRouter.post("/delete/:id",verifyAdmin, deleteUser)
userRouter.post("/message",verifyAdmin, sendMessage)
userRouter.get("/singleUser/:id", getSingleUser)
userRouter.post("/approve/:id",verifyAdmin, approveUser)
userRouter.post("/credit/:id",verifyAdmin, creditUser)
userRouter.post("/setbalance/:id",verifyAdmin, editUserBalance)



module.exports=userRouter