const { verifyAdmin } = require("../user/verify");
const investmentModel = require("../../models/investmentModel");
const userModel = require("../../models/userModel");
const withdrawalModel= require("../../models/withdrawalModel")
const coinModel= require("../../models/coinModel")
const paymentModel= require("../../models/payment")
const createCustomError = require("../../createCustomError");


// approve deposit logic



const approveDeposit = async (req, res, next) => {

  const plans = {
    starter: { bonus: 15, duration: 24 },
    premium: { bonus: 40, duration: 48 },
    ultimate: { bonus: 65, duration: 72 },
    standard: { bonus: 25, duration: 48 },
    exclusive: { bonus: 50, duration: 72 },
    corporate: { bonus: 50, duration: 72 },
  };

  const { id } = req.params;
  try {
    const thisDeposit = await investmentModel.findById(id);
    const { userId, amount, plan } = thisDeposit;
    const extra = (plans[plan].bonus * amount) / 100;
    
    const newInvestment = await investmentModel.findByIdAndUpdate(
      id,
      { $set: { status: "active", approvedDate:new Date() } },
      { new: true }
    );

    const newUserDetails = await userModel.findByIdAndUpdate(
      userId,
      { $inc: { balance: amount }, $push:{approveDeposit:newInvestment._id} },
      { new: true }
    );



   
    res.status(200).json({ success: true, result: newInvestment });
  } catch (error) {
    next(createCustomError(error.message));
  }
};
// approve deposit logic ends here

// approve withdrawal logic  
const approveWithdrawal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const newWithdrawal = await withdrawalModel.findByIdAndUpdate(
      id,
      { $set: { status: "approved" } },
      { new: true }
    );
    res.status(200).json({ success: true, result: newWithdrawal });
  } catch (error) {
    next(createCustomError(error.message));
  }
};
// approve withdrawal logic ends here

// decline deposit starts here

const declineInvestment= async (req,res,next)=>{
    try {
        const {id}= req.params
         const newInvestment= await investmentModel.findByIdAndUpdate(id,{$set:{status:"declined"}},{new:true})
         res.status(200).json({success:true, result:newInvestment})
    } catch (error) {
        next(createCustomError(error))
    }
  }

// decline deposit ends here


//  decline withrawal
const declineWithdrawal = async (req, res, next) => {
  try {
    const { id } = req.params;
    const newWithdrawal = await withdrawalModel.findByIdAndUpdate(
      id,
      { $set: { status: "declined" } },
      { new: true }
    );
    res.status(200).json({ success: true, result: newWithdrawal });
  } catch (error) {
    next(createCustomError(error.message));
  }
};
//  decline withrawal ends here


// editCoin starts here
const editCoin = async (req, res, next) => {
  try {
    const updatedCoin = await coinModel.findByIdAndUpdate(
      "btctrustfund",
      { $set: req.body },
      { new: true }
    );
    res.status(200).json({ success: true, result: updatedCoin });
  } catch (error) {
    next(createCustomError(error.message));
  }
};
// editCoin ends here

//  get all investments starts here
const getInvestments = async (req, res, next) => {
  try {
    const allInvestments = await investmentModel.find();
    return res.status(200).json({ success: true, result: allInvestments });
  } catch (error) {
    next(createCustomError(error.message));
  }
};
//  get all investments ends here



// getstats starts here
const getStats = async (req, res, next) => {
  try {
    const allUsers = await userModel.find({});
    const allInvestments= await investmentModel.find({}).populate("userId")
    const allWithdrawals= await withdrawalModel.find({}).populate("userId")
    const allPayments=await paymentModel.find({}).populate({
      path:"user",
      select:"name idImg _id phone "
    })
    res.status(200).json({ success: true, result: {allUsers,allWithdrawals, allInvestments,allPayments} });
  } catch (err) {
    next(createCustomError(err.message));
  }
};

// getstats ends here

// get withdrawals start here
const getWithdrawals= async(req,res,next)=>{
    try {
        const allWithdrawals= await withdrawalModel.find({})
        return res.status(200).json({success:true, result:allWithdrawals})
    } catch (error) {
        next(createCustomError(error.message))
    }
}



// get withdrawals  ends here






 


module.exports = {
  editCoin,
  verifyAdmin,
  getStats,
  getInvestments,
  getWithdrawals,
  approveWithdrawal,
  declineWithdrawal,
  approveDeposit,
  declineInvestment
};
