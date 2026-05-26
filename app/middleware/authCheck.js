const jwt=require('jsonwebtoken');

const AuthCheck=(req,res,next)=>{
    if(req.cookies && req.cookies.token){
        jwt.verify(req.cookies.token,process.env.JWT_SECRECT,(err,data)=>{
            if(err){
                return res.status(400).json({
                    status:false,
                    message:"invalid token"
                })
            }
            req.user=data;
            next();
        })
    } else{
        return res.status(400).json({
            status:false,
            message:'Token is required for access this url'
        })
        next();
    }
    
}


module.exports=AuthCheck