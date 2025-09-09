const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    courseName:{
        type:String,
    },
    courseDescription:{
        type:String,
    },
    instructor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    whatYouWillLearn:{
        type:String,
    },
    // section details -- storing the content of the course in array
    courseContent:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Section"
    }],
    ratingAndReviews:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"RatingAndReviews"
    }],
    price:{
        type:Number,
        required:true,
    },
    tag:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Tag",
        required:true,
    },
    StudentEnrolled:[{
         type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    }],
    instruction:{
        type:{String}
    },
    status:{
        type:String,
        enum:["draft","published"],
        default:"draft"
    }
});

module.exports = mongoose.model("Course",courseSchema);