const mongoose=require("mongoose")
const {Schema}=mongoose
const investmentSchema= mongoose.Schema({
    amount:{
type:Number,
required:true
    },

    userId:{
        type:Schema.Types.ObjectId,
        ref:"users",
        required:true
    },
    approvedDate:{
        type:Date,
        
    },
    coin:{
        type:String,
        enum:["doge", "ethereum", "usdt","bitcoin"],
        required:true
    },
    status:{
        type:String,
        enum:["pending", "approved", "rejected", "active"],
        default:"pending"
    },
    plan:{
        type:String,
        enum:["starter", "premium", "ultimate", "corporate","exclusive", "standard"], 
        required:true
    },

}, {timestamps:true})
module.exports= mongoose.model("investments",investmentSchema)

