const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenrator = require("otp-genrator");
const bcrypt = require("bcrypt");
const { signedCookie } = require("cookie-parser");


// send otp
exports.sendOTP = async (req,res) => {
    try{
        // fetch email from the request body
        const {email} = req.body;

        // check if the user already exits with the current email
        const checkUserPresent = await User.findOne({email});

        // if the user already present in the DB then sendthe response
        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message:"User Already registered",
            })
        }

        // else if user not exits, gnerate the OTP for verification
        // six is the length of OTP
        // along with length we need to pass the Options as object in gnerate function
        var otp = otpGenrator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        })

        console.log("OTP Generated : ",otp);

        // verify if the OTP genrated is unique or not
        let result = await OTP.findOne({otp:otp});

        // till u dont get the unique OTP,keep genrating and verifying it
        // it is bad method of OTP gneration
        // library exits for gnerating the unique OTP
        while(result){
            otp = otpGenrator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
            })
            result = await OTP.findOne({otp:otp});
        }

        // make the entry of OTP into dataBase
        const otpPayload = {email,otp};
        const otpBody = await OTP.create(otpPayload);

        console.log(otpBody);

        // return the response that OTP has been gnerated
        res.status(200).json({
            success:true,
            message:"OTP sent SuccessFully",
            otp,
        })

    }
    catch(error){

        console.log(error);
        return res.status(500).json({
            success:true,
            message:error.message
        })

    }
}

// sign Up
exports.signUp = async (req,res)=>{
    try{
        // fetch the data from request body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType, // either student or instructor
            contactNumber, // optional
            otp,            
        } = req.body;

        // validate if all the data are send are not not
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(403).json({
                success:false,
                message:"All the fields are required",
            })
        }

        // check if password and confirm password are same
        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Password and Confirm Password Value does not match, Please try again",
            })
        }

        // now check if the user already exits are not
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"User is Already regitered",
            })
        }

        // now for a email or User multiple OTP may have been gnerated
        // we need to pickUp the most recent OTP and then verify it with OTP with otpfrom req.body
        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log(recentOtp);

        if(recentOtp == 0){
            // otp not found
            return res.status(400).json({
                success:false,
                message:"OTP not Found"
            })
        }
        else if(otp !=  recentOtp.otp){
            //Invalid OTP -> User entered the wrong OTP
            return res.status(400).json({
                success:false,
                message:"Invalid OTP",
            });
        }

        // In User model we have additionalDetails field refering to the Profile
        // so we need to create its instnace in the DB
        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contact: null, 
        })

        // now the verify has been verified we can hash the password and save it to the DB
        // hash Password
        const hashedPassword = await bcrypt.hash(password,10);
        const  user = await User.create({
            firstName,
            lastName,
            email,
            password:hashedPassword,
            accountType,
            additionalDetails:profileDetails,
            // this api gives image taking first letter of firstName and last Name
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstname} ${lastName}`,
        })

        // now user has been created send the response bro
        res.status(200).json({
            success:true,
            message:"User is registered successfully",
            user,
        })

    }
    catch(error){

        console.log(error);
        res.status(500).json({
            success:false,
            message:"User can not be registered , Please try again",
        })
    }
} 

// login
exports.login = async (req,res)=>{
    try{
        // fetch the data from the request body
        const {email,password} = req.body;

        // check if all the data related to login are send are not
        if(!email || !password){
            return res.status(403).json({
                success:true,
                message:"All fields are required,Please try again"
            })
        }

        // check if the user exits or not
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User does not exits"
            })
        }

        // genrate the JWT token after password matching
        if(await bcrypt.compare(password,user.password)){
            // payload contains the information about the user
            // this information is again used while creating course Controller to verify instructor
            const payload = {
                email:user.email,
                id:user._id,
                accountType:user.accountType,
            }
            // create the token
            const token = jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIN:"2h",
            })

            user.token = token; // save the token inside the user and not in DB
            user.password = undefined; // hide the password

            //  create the cookie, in which we are required to pass the cookie first
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true,
            }
            // send the cookie in response
            return res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:"Logged in SuccessFully",
            })
        }
        else{
            return res.status(401).json({
                success:false,
                message:"Password is inCorrect",
            })
        }

    }
    catch(error){
        // if errors occur while doing login Just return
        console.log(error);

        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

// changePassword
exports.changePassword = async (req,res) =>{
    try{

        // fetch all the data from req.body first
        const {email ,oldPassword,newPassword,confirmNewPassword} = req.body;

        // validate if all the fieds are send or not
        if(!email || !oldPassword || !newPassword || !confirmNewPassword ){
            return res.status(404).json({
                success:false,
                message:"Data for authentication not found"
            })
        }

        // check if the user exits already or not
        const user = User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User does not exits"
            })
        }

        // check if newPassword matches with confirmNewPassword
        if(newPassword !== confirmNewPassword){
            return res.status(403).json({
                success:false,
                message:"New Password does not match with Confirm New password"
            })
        }

        // check if the entered Password matches with Current Password
        if(await bcrypt.compare(oldPassword,user.password)){
            // if passWord matches ,save the newPassword into DB by hashing it first
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            // 6. Save updated password
            user.password = hashedPassword;
            await user.save();

            return res.status(200).json({
            success: true,
            message: "Password updated successfully",
            });
        }
        else {
            return res.status(403).json({
                success:false,
                message:"Password does not match",
            })
        }

    }
    catch(error){
        console.log(error)
        console.log("Error while trying to chnage password");
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}