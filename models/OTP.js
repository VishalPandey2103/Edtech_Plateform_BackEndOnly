const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");

const OTPSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires:5*60,
    }
});

// mail code as o be written after Schema and before model creation
async function sendVerificationEmail(email,otp) { // 2
    try{
        // calling mailSender funcion presnt in other file, so first we  need to import it first
        const mailResponse = await mailSender(email,"Verification email from StudyNotion",otp);
        console.log("Email Sent SuccessFully : ",mailResponse);
    }
    catch(error){
        console.log(error);
        // adivisable to write 
        console.log("Error occured while sending EMial for OTP")
        throw error;
    }
}

// dataBase mein entry save krne se phele ye kaam karo 
OTPSchema.pre("save",async function(next){
    // this.email helps to get the current email
    await sendVerificationEmail(this.email,this.otp); // 1
    next(); // move to the next middleWare
})

module.exports = mongoose.model("OTP",OTPSchema);