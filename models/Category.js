const mongoose = require("mongoose");
// to filter the Courses
const categorySchema = new mongoose.Schema({
    // name of the category
    name:{
        type:String,
        required:true,
    },
    description:{
        type:String,
    },
    // if we have the tag name , we can use it to find the related course
    course:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
    }],
});

module.exports = mongoose.model("Category",categorySchema);