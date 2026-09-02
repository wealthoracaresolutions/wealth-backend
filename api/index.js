const express = require("express");
const cors = require("cors");
const connect_Db = require("./connectdb");
const dotenv = require("dotenv");
//  user Functions

//  admin functions


//  request functions

const userRouter = require("./Routes/user/userRoute");
const handleError = require("./error");
const requestRoute = require("./Routes/requests/requestRoute.js");
const adminRouter = require("./Routes/admin/route.js");
const paymentRouter= require("./Routes/payments/paymentRoute.js")
const loanRouter = require("./Routes/loans/loanRoute.js");
const userModel = require("./models/userModel.js");
const investmentModel = require("./models/investmentModel.js");
const withdrawalModel = require("./models/withdrawalModel.js");

dotenv.config();
const server = express();
server.use(cors());
server.use(express.json());
server.use("/users", userRouter)
server.use("/admin", adminRouter)
server.use("/requests", requestRoute)
server.use("/payments", paymentRouter)
server.use("/loans", loanRouter)

//  user routing optimized to fit with vercel's free tier serverless function count polic
// server.post("users/login", login);
// server.post("users/register", register);
// server.get("users/getcoins", getCoins);
// server.post("users/tklogin", verify, loginWithToken);
// server.post("users/getstats", verify, getTotalStat);
// server.post("users/addwallet", verify, addWallet);

// end user Routing

// start admin routing optimized

// server.post("admin/editcoin", verifyAdmin, editCoin);
// server.post("admin/getStats", verifyAdmin, getStats);
// server.post("admin/getinvestments", verifyAdmin, getInvestments);
// server.post("admin/getwithdrawals", verifyAdmin, getWithdrawals);
// server.post("admin/approvewithdrawal/:id", verifyAdmin, approveWithdrawal);
// server.post("admin/declinewithdrawal/:id", verifyAdmin, declineWithdrawal);
// server.post("admin/approveinvestment/:id", verifyAdmin, approveDeposit);
// server.post("admin/declineinvestment/:id", verifyAdmin, declineInvestment);

//  end admin route

//  request route
// server.post("requests/withdraw", verify, withdraw);
// server.post("requests/invest", verify, invest);



server.get("/", (req, res) => {
  res.send("okay");
});
server.use(handleError);
const mongo_uri = process.env.mongo_uri;
const port = process.env.PORT || 5000;

server.get("/", (req, res, next) => {
  res.status(200).send("developed by me");
})

  
  const removeStaleEntries=async(model)=>{
    try{
      const  thisDocument= await model.find()
      const updatedDocument= await Promise.all(
        thisDocument.map(async(doc)=>{
         const user= await  userModel.findById(doc.userId)
         if(!user){
          await model.findByIdAndDelete(doc._id)
         } 
        })
      )

      console.log("model refresh was successful")
    }catch(err){
    console.log(err.message)
    }
  }
  // removeStaleEntries(withdrawalModel)
const startServer = async () => {
  try {
    await connect_Db(mongo_uri);
    // await userModel.updateMany({},{$set:{stautus:"approved"}})
    server.listen(port, () => {
      console.log(`Server is actively listening on port ${port}`);
    });
  } catch (error) {
    console.log(error.message);
  }
};
startServer();
