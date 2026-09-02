const {Schema,model} = require("mongoose")
const paymentSchema=Schema({
user:{
    type:Schema.Types.ObjectId,
    ref:"users",
    required:true
},
status:{
    type:String,
    enum:["pending", "approved","rejected"],
    default:"pending"
},
amount:{
type:Number,
required:true,
},
service:{
type:String,
required:true,

},
paymentMethod:{
type:String,
enum:["bank", "crypto"]
},
proof:{
    type:String,
    required:true,
    
},
plan:{
    type:String
},
coin:{
    type:String
},
quantity:Number,
metaData:{
    
}

},{timestamps:true}) 

module.exports= model("payments" ,paymentSchema)