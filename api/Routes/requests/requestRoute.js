const {Router} = require("express")
const { withdraw, invest } = require("./requests.js");
const { verify } = require("../user/verify.js");


const requestRouter= Router()

requestRouter.post("/withdraw",verify, withdraw)
requestRouter.post("/invest",verify, invest)

module.exports=requestRouter