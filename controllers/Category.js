const Category = require("../models/Category");

// create Category request handler

exports.createCategory = async (req, res) => {
    try {
        // fetch the data from req.body
        const { name, description } = req.body;

        // performing validation
        if (!name || !description) {
            return res.status(404).json({
                success: false,
                message: "All fields are required",
            })
        }

        // create the entry into the Database
        const categoryDetails = await Category.create({
            name: name,
            description: description
        });

        console.log(categoryDetails);

        return res.status(200).json({
            success: true,
            message: "Category details Created successfully"
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// getting all the categories
exports.getAllCategories = async (req, res) => {
    try {
        const allCategory = await Category.find({}, { name: true, description: true });

        return res.status(200).json({
            success: true,
            allCategory,
            message: "Categories fetched successfully",
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// category Page Details  .. Tag changed to category
exports.categoryPageDetails = async (req, res) => {
    try {
        const categoryId = req.body.categoryId;

        const selectedCategory = await Category.findById({ categoryId }
            // populate the course details
        ).populate("course", "courseName").exec();

        if (!selectedCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            })
        }

        // get courses for different category
        const differentCategory = await Course.find(
            { _id: { $ne: categoryId } } // ne means not equal
        ).populate("courses").exec();

        // getting the top selling courses
        // top selling courses will be the one which has greater number of students enrolled
        // so return the top 5 courses
        const topSellingCourses = await Course.aggregate([
            {
                $addFields: {
                    enrolledCount: { $size: "$studentsEnrolled" } // compute array length
                }
            },
            {
                $sort: { enrolledCount: -1 } // sort descending
            },
            {
                $limit: 5 // take top 5
            }
        ]);


        return res.status(200).json({
            success: true,
            data: {
                differentCategory,
                selectedCategory,
                topSellingCourses
            },
            message: "Category details fetched successfully",
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}