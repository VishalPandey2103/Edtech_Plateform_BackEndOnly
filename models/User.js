const mongoose = require("mongoose");
const { resetPassword } = require("../controllers/ResetPassword");

const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        trim:true
    },
    lastName:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
    },
    accountType:{
        type:String,
        enum:["Admin","Student","Instructor"],
        required:true,
    },
    // Profile Content on UI
    additionalDetails:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Profile",
    },
    // It is an array of course IDs that the user is enrolled in, so we would to use push method to user new Course
    // and created by the Instructor
    courses:[{
         type:mongoose.Schema.Types.ObjectId,
         ref:"Course"
    }],
    image:{
        type:String, // URL
        required:true,
    },
    courseProgress:[{
         type:mongoose.Schema.Types.ObjectId,
         ref:"CourseProgress"
    }],
    token:{
        type:String,
    },
    resetPasswordExpires:[{
        type:Date,
    }],
});

module.exports = mongoose.model("User",userSchema);