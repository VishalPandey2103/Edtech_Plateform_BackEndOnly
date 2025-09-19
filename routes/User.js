const express = require("express");
const router = express.Router();

const { login, sendOTP, signUp, changePassword } = require("../controllers/Auth");
const { resetPassword, resetPasswordToken } = require("../controllers/ResetPassword");

// to be verified
const { auth } = require("../middleware/auth");

// Send OTP
router.post("/sendOTP", sendOTP);

// Sign Up
router.post("/signup", signUp);

// Login
router.post("/login", login);

// Change Password (protected route)
router.post("/change-password", auth, changePassword);

// Reset Password Token
router.post("/reset-password-token", resetPasswordToken);

// Reset Password
router.post("/reset-password", resetPassword);

module.exports = router;            