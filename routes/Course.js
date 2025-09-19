const express = require("express");
const router = express.Router();

const {
    createCourse,
    getAllCourses,
    getCourseDetails,
} = require("../controllers/Course");

// Section
const {
    createSection,
    updateSection,
    deleteSection,
} = require("../controllers/Section");

// Category
const {
    createCategory,
    getAllCategories,
    categoryPageDetails,
} = require("../controllers/Category");

// Subsection
const {
    createSubSection,
    updateSubSection,
    deleteSubSection,
} = require("../controllers/Subsection");

// Rating & Review
const {
    createRatingAndReview,
    getAverageRating,
    getAllRatingsAndReviews,
} = require("../controllers/RatingAndReview");

// ==========================
// Middleware
// ==========================
const {
    auth,
    isAdmin,
    isStudent,
    isInstructor, // fixed typo
} = require("../middleware/auth");

// ==========================
// Course Routes
// ==========================
router.post("/createCourse", auth, isInstructor, createCourse);
router.get("/getAllCourses", getAllCourses);
router.post("/getCourseDetails", getCourseDetails);

// Section Routes
router.post("/addSection", auth, isInstructor, createSection);
router.post("/updateSection", auth, isInstructor, updateSection);
router.post("/deleteSection", auth, isInstructor, deleteSection);

// Subsection Routes
router.post("/addSubsection", auth, isInstructor, createSubSection);
router.post("/updateSubsection", auth, isInstructor, updateSubSection);
router.post("/deleteSubsection", auth, isInstructor, deleteSubSection);

// ==========================
// Category Routes
// ==========================
router.post("/createCategory", auth, isAdmin, createCategory);
router.get("/showAllCategories", getAllCategories);
router.post("/getCategoryPageDetails", categoryPageDetails);

// ==========================
// Rating and Review Routes
// ==========================
router.post("/createRating", auth, isStudent, createRatingAndReview);
router.get("/getAverageRating", getAverageRating);
router.get("/getReviews", getAllRatingsAndReviews);

module.exports = router;
