const mongoose = require("mongoose");

const courseProgressSchema = new mongoose.Schema({

    courseID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
    },

    completedVideos:[{ // array of completed videos
        type:mongoose.Schema.Types.ObjectId,
        ref:"SubSection",
    }]
})

module.exports = mongoose.model("CourseProgress",courseProgressSchema);