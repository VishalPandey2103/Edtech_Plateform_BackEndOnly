const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");

exports.createRatingAndReview = async (req, res) => {
    try {
    const { courseId, rating, review } = req.body;
    const userId = req.user.id;

        // Validate input
        if (!courseId || !rating || !review) {
            return res.status(400).json({
                success: false,
                message: "Please provide all fields"
            });
        }

        // Check if course exists and the user also enrolled in it
        const course = await Course.findOne({
            _id: courseId,
            studentsEnrolled: { $eq: userId }
        });

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }


        // check if the user already reviwed or not
        const alreadyReviewed = await RatingAndReview.findOne(
            { user: userId, course: courseId }
        );

        // if the user already created by the user , then no need to recreate it
        if (alreadyReviewed) {
            return res.status(400).json({
                success: false,
                message: "You have already reviewed this course"
            });
        }

        // Create new rating and review
        const newRatingAndReview = await RatingAndReview.create({
            course: courseId,
            user: req.user.id,
            rating,
            review
        });

        // Add rating and review to course
        course.ratingAndReviews.push(newRatingAndReview._id);
        await course.save();

        return res.status(201).json({
            success: true,
            data: newRatingAndReview
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

// get the average rating 
exports.getAverageRating = async (req, res) => {
    try {
        // course will have multiple reviews and ratings 
        const courseId = req.body.courseId;

        // caluclate the avg rating
        const result = await RatingAndReview.aggregate([
            {
                // explanation : this will match the courseId provided to all the rating and reviews present in the DB
                $match: {
                    course: new mongoose.Types.ObjectId(courseId)
                }

            },
            { // explanation : this will group all the matched documents and calculate the average rating
                $group: {
                    _id: null,// this is the group by field, we are not grouping by any specific field
                    averageRating: { $avg: "$rating" } // here $rating is the field in the document whose avg we have to calculate
                }
            }
        ])

        // Send the average rating as response
        // aggregate function will be returing an array and that will be stored in the result variable
        if (result.length > 0) {
            return res.status(200).json({
                success: true,
                averageRating: result[0].averageRating
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "No ratings found"
            });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 

// get all rating -> when u click on see all reviews
exports.getAllRatingsAndReviews = async (req, res) => {
    try {
        const courseId = req.body.courseId;

        const ratingsAndReviews = await RatingAndReview.find({ course: courseId })
            .populate("user", "name email") // it will only populate user name and email
            .populate("course", "courseName") // it will only populate course name 
            .sort({ createdAt: -1 }); // latest reviews first
            

        return res.status(200).json({
            success: true,
            data: ratingsAndReviews
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};