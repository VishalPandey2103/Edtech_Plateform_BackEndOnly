const Category = require("../models/Category");
const Course = require("../models/Course");
const User = require("../models/User");
const { uploadImageTocloudinary } = require("../utils/imageUploader");
require("dotenv").config();

// when we reach the course route we see there is option to upload a file,
// so we will be uploading it to Cloudinary so that we can access it later
// so create the function to upload it to cloudinary


// create the course
exports.createCourse = async (req, res) => {
    try {

        // fetch all data from the request body
        // here tag is the ID sent in the Request URL
        const { courseName, courseDescription, whatYouWillLearn, tag } = req.body;
        // get the image(thumbnail) from the request
        const thumbnail = req.files?.thumbnailImage;

        // now validation if all the data sent or not
        if (!courseName || !courseDescription || !whatYouWillLearn || !tag || !thumbnail) {
            return res.status(400).json({
                success: false,
                message: "Please provide all the fields"
            });
        }

        // now validation if the Instructor for the Given ID exists or not
        // during validation in auth middleware we have inserted the user in the request URL
        const userId = req.user.id;
        // this userId and instructorId are the same
        const instructorDetails = await User.findById(userId);
        if (!instructorDetails) {
            return res.status(404).json({
                success: false,
                message: "Instructor not found"
            });
        }

        // validate if the tag exists or not
        const tagDetails = await Category.findById(tag);
        if (!tagDetails) {
            return res.status(404).json({
                success: false,
                message: "Tag not found"
            });
        }

        // now upload the thumbnail image to Cloudinary
        const thumbnailImage = await uploadImageTocloudinary(thumbnail, process.env.FOLDER_NAME);
        if (!thumbnailImage) {
            return res.status(500).json({
                success: false,
                message: "Failed to upload image"
            });
        }

        // 

        // while creating the courese in model we have insertred the Instructor object ID
        // we have the Instructor UserID but not object ID -> so first the instructor detail from DB
        const instructorID = instructorDetails._id;

        // create new entry for the course in the DataBase
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructorDetails: instructorID,
            whatYouWillLearn: whatYouWillLearn,
            tag: tagDetails._id, // id beacuse we need to store the reference,
            thumbnail: thumbnailImage.secure_url, // we need the URL of the image
            price,
        })

        // add the course inside the Instructor
        await User.findByIdAndUpdate(
            { instructorID }, // find the User with this Object ID in the DB
            { $push: { courses: newCourse._id } }, // push the new course ID into the user's courses array
            { new: true }, // return the updated user document
        )

        // update the tag schema
        tagDetails.courses.push(newCourse._id);
        await tagDetails.save();

        // return the newly created course
        return res.status(201).json({
            success: true,
            message: "Course created successfully",
            data: newCourse
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}




// get all the course
exports.getAllCourses = async (req, res) => {
    try {
        // fetch all the course from the DB
        // here {} means we are not applying any filter
        // and second parameter is the field that must be included in the result 
        const allCourses = await Course.find({}, {
            courseName: true,
            price: true,
            thumbnail: true,
            instructor: true,
            ratingAndReviews: true,
            StudentEnrolled: true,
        }).populate("instructor").exec();

        // return response
        return res.status(200).json({
            success: true,
            data: allCourses
        });

    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

//handler for getCourse Details
exports.getCourseDetails = async (req, res) => {
    try {

        // fetch the CourseId from the request body
        const { id } = req.body;

        const courseDetails = await Course.findById(id).populate(
            {
                path: "instructor",
                populate: {
                    path: "additionalDetails"
                }
            }
        ).populate("tag")
            .populate("category")
            .populate("ratingAndReviews").
            populate({
                path: "Section",
                populate: {
                    path: "subsection"
                }
            }).exec();

        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: courseDetails
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}