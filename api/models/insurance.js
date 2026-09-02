const {Schema, model}= require("mongoose")

const insuranceSchema= Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:"users",
        required:true
    },

    payment:{
        type:Schema.Types.ObjectId,
        ref:"payments",
        required:true

    },
    quantity:Number
    


}, {timestamps:true})
module.exports= model("insurance", insuranceSchema)