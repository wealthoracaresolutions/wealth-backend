const createCustomError=(message, code)=>{
 message=message||"Oops an error occured"
 code=code||500
 return {message,code}
}
module.exports=createCustomError