const express = require("express");
const router = express.Router();

const { deleteAccount, updateProfile, getAllUserDetails, getEnrolledCourses, updateDisplayPicture } = require("../controllers/Profile");
const { auth } = require("../middleware/auth");

// Update Profile
router.put("/updateProfile", auth, updateProfile);

// Delete Account
router.delete("/deleteProfile", auth, deleteAccount);

// Get All User Details
router.get("/getUserDetails", auth, getAllUserDetails);

// Get Enrolled Courses
router.get("/getEnrolledCourses", auth, getEnrolledCourses);

// Update Display Picture
router.put("/updateDisplayPicture", auth, updateDisplayPicture);

module.exports = router;