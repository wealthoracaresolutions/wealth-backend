const { verifyAdmin } = require("../user/verify");
const investmentModel = require("../../models/investmentModel");
const userModel = require("../../models/userModel");
const withdrawalModel= require("../../models/withdrawalModel")
const coinModel= require("../../models/coinModel")
const paymentModel= require("../../models/payment")
const createCustomError = require("../../createCustomError");
const { sendUserNotification } = require("../../services/userEmail");


// approve deposit logic



const approveDeposit = async (req, res, next) => {
  const { id } = req.params;
  try {
    const newInvestment = await investmentModel.findOneAndUpdate(
      { _id: id, status: "pending" },
      { $set: { status: "active", approvedDate: new Date() } },
      { new: true }
    );
    if (!newInvestment) {
      const existingDeposit = await investmentModel.findById(id);
      if (!existingDeposit) {
        return res.status(404).json({ success: false, result: "Deposit not found" });
      }
      return res.status(409).json({ success: false, result: "Deposit has already been processed" });
    }

    const { userId, amount, coin } = newInvestment;
    const currencyNames = {
      bitcoin: "bitcoin",
      ethereum: "ethereum",
      usdt: "USDT",
      doge: "dogecoin",
    };
    const formattedAmount = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
    const message = `Your deposit of $${formattedAmount} worth of ${currencyNames[coin] || coin} has been approved.`;
    const notification = {
      title: "Deposit approved",
      message,
      createdAt: new Date(),
      read: false,
    };

    const newUserDetails = await userModel.findByIdAndUpdate(
      userId,
      {
        $inc: { balance: amount },
        $push: {
          activeDeposit: newInvestment._id,
          notifications: notification,
        },
      },
      { new: true }
    );
    if (!newUserDetails) {
      throw new Error("User associated with this deposit was not found");
    }

    await sendUserNotification(userId, {
      subject: "Deposit approved - Wealthoracaresolutions",
      message,
    });

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
    if (!newWithdrawal) {
      throw new Error("Withdrawal not found");
    }
    await sendUserNotification(newWithdrawal.userId, {
      subject: "Withdrawal approved - Wealthoracaresolutions",
      message: `Your withdrawal request for $${newWithdrawal.amount} has been approved.`,
    });
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
