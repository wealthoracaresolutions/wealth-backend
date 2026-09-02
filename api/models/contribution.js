const {Schema, model}= require("mongoose")

const contributionSchema= Schema({
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
    

}, {timestamps:true})
module.exports= model("contributions", contributionSchema)