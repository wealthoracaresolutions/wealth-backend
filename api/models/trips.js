const {Schema, model}= require("mongoose")

const tripSchema= Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:"users",
        required:true

    },

    payment:{
        type:Schema.Types.ObjectId,
        ref:"payments",
        

    },
    destination:{
        type:String
    },
    startingPoint:{
        type:String,


    },
    paymentStatus:{
        type:String,
        enum:["waiting for quote", "pending", "confirmed" ],
        default:"waiting for quote"
    },
    time:{
        type:Date,
        required:true
    },
    cost:{
        type:Number,
        default:0
    }


}, {timestamps:true})
module.exports= model("trips", tripSchema)