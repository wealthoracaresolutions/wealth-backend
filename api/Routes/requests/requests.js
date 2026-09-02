const express= require("express")
const withdrawalModel = require("../../models/withdrawalModel.js");
const createCustomError = require("../../createCustomError.js");
const userModel = require("../../models/userModel.js");
const {verify}=require("../../Routes/user/verify")
const investmentModel = require("../../models/investmentModel");


// withdraw logic starts
const  withdraw=  async(req,res,next)=>{
    const {amount,walletId}= req.body
try{

    const user= req.user 
const userId= user.id
const newTransaction= await withdrawalModel.create({...req.body,userId}) 
const  newUserDetails=await userModel.findByIdAndUpdate(userId,{$inc:{balance:(-1*amount)},$set:{pendingWithdrawal:amount,lastWithdrawal:amount}})
 return res.status(200).json({success:true,result:newTransaction})
}
catch(err){
    console.log(err.message)
    next(createCustomError(err.message))
}

    

}
// withdraw ends here


//  invest logic goes here

const invest = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const newInvestment = await investmentModel.create({ userId, ...req.body });
    await userModel.findByIdAndUpdate(userId, {
      $set: { lastDeposit: req.body.amount },
    });
    res.status(200).json({ success: true, result: newInvestment });
  } catch (err) {
    next(createCustomError(err.message));
  }
};
//  invest logic goes here






module.exports= {withdraw, invest}