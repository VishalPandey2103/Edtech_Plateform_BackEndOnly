const User = require("../models/User")
const mailSender = require("../utils/mailSender")

// resetPasswordToken
// gnerates the link and mail it to the user for verification 
exports.resetPasswordToken = async (req,res)=>{
    try{
        // get email from the request body
        const {email} = req.body;
        // check user for this , email validation
        const user = await User.findOne({email:email});
        if(!user){
            return res.status(404).json({
                success:false,
                message:"Your email is not registered with Us",
            })
        }

        // generate the token,also we need to set the expiration time
        const token = crypto.randomUUID(); // randomy genrated

        // Update the User by adding the token and exprirating time
        const updatedDetails = await User.findOneAndUpdate(
                                    {email:email},
                                    {
                                        token:token,
                                        resetPasswordExpires:Date.now + 5*60*1000,
                                    },
                                    {new:true}
        );

        // generating the link
                // this token will help u to get the differnt differnt URL for reseting the password
        const url = `htttp://localhost:3000/update-password/${token}`;

        // send the email
        await mailSender(email,"Password Reset Link",`Password reset Link : ${url}`);


        return res.status(200).json({
            success:true,
            message:"Reset Password link sent to the Email"
        });
        
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}


// resetPassword
exports.resetPassword = async (req,res)=>{
    try{
        // fetch the data from req.body
        // we have send the token in the URL , then how we are taking it from body
        // this activity has been done by the frontEnd
        const {password,confirmPassword,token} = req.body;
        
        // check if the Password and confirmPassword sent matches or not
        if(password !== confirmPassword){
            return res.json({
                success:false,
                message:"Password and Confirm Password Does not match"
            })
        }

        // get the user Details from the database using token
        const userDetails = await User.findOne({token:token});

        // if no entry realted to it sedn the response immdiately
        if(!userDetails){
            return res.json({
                success:false,
                message:"Token is Invalid, No user Found related to it"
            })
        }
        // token time check  
        if(userDetails.resetPasswordExpires < Date.now()){
            return res.json({
                success:false,
                message:"Token os expired",
            })
        }

        // hashed password
        const hashedPassword = await bcrypt.hash(password,10);

        // update the password into the DataBase
        await User.findOneAndUpdate(
            {token:token},
            {password:hashedPassword},
            {new:true},
        );

        // send the response
        return res.status(200).json({
            success:true,
            message:"Password reset SuccessFully",
        });

    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}