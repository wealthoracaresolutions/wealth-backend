const handleError= (err,req,res,next)=>{
    return res.status(err.code).json({success:false,result:err.message})
}


module.exports=handleError