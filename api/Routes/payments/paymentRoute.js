const {Router}= require("express")
const { 
    createPayment,
     approvePayment,
     getInsurance,
     getContributions,
      createTrip,
       getMytrips,
        getAllTrips,
         editTrip 
        } = require("./controllers")
const { verifyAdmin, verify } = require("../user/verify")
const paymentRouter= Router()

paymentRouter.get("/contributions", getContributions)
paymentRouter.get("/alltrips", getAllTrips)
paymentRouter.post("/createTrip",verify ,createTrip)
paymentRouter.post("/edittrip/:id",editTrip)
paymentRouter.post("/mytrips",verify ,getMytrips)
paymentRouter.post("/create",verify, createPayment)
paymentRouter.post("/getmyinsurance",verify, getInsurance)
paymentRouter.post("/approve/:paymentId",verifyAdmin, approvePayment)


module.exports= paymentRouter
module.exports= paymentRouter