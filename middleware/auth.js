import jwt from "jsonwebtoken";


export const auth = async (request,response,next)=>{
try{
    // console.log(req.header);
    // console.log(req.header());
    const token = await request.header("x-auth-token");
    console.log(token);
    jwt.verify(token,process.env.secretKey);
    console.log("verification",jwt.verify(token,process.env.secretKey));
    next();
}catch(err){
    console.log(jwt.verify("Authorization error",err.message));
    response.status(401).send(err.message);
}
};
