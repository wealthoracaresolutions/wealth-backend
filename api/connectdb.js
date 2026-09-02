const mongoose=require("mongoose")

const connect_Db=  async(mongo_uri)=>{
    try {
        await mongoose.connect(mongo_uri)
    console.log("connected")
    } catch (error) {
        console.log(error.message)
    }

}
module.exports= connect_Db