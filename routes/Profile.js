const express = require("express");
const router = express.Router();

const { deleteAccount, updateProfile, getAllUserDetails, getEnrolledCourses, updateDisplayPicture } = require("../controllers/Profile");
const { auth } = require("../middleware/auth");

// Update Profile
router.put("/update-profile", auth, updateProfile);

// Delete Account
router.delete("/delete-account", auth, deleteAccount);

// Get All User Details
router.get("/user-details", auth, getAllUserDetails);

// Get Enrolled Courses
router.get("/enrolled-courses", auth, getEnrolledCourses);

// Update Display Picture
router.put("/update-display-picture", auth, updateDisplayPicture);

module.exports = router;