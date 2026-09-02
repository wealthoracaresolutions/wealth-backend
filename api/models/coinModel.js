const mongoose = require("mongoose");

const coinSchema = mongoose.Schema({
    _id:{type:String, default:"btctrustfund"},
    bitcoin:{type:String, default: "unset"},
    ethereum:{type:String, default: "unset"},
    doge:{type:String, default: "unset"},
    usdt:{type:String, default: "unset"},
});
module.exports =  mongoose.model("coins", coinSchema)
