const jwt = require("jsonwebtoken")
require("dotenv").config()
const User = require("../models/User")

// auth
// ordering of middleware are defined in routes
// best way to get token bearer method , worst method body
exports.auth = async (req, res, next) => {
    try {

        // extract the token
        const token = req.cookie.token || req.body.token
            || req.header("Authorisation").replace("Bearer", "");

        // if token is missing , return the response immdiately
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token is missing"
            })
        }

        // verify the token on the basis of secretkey
        try {
            const decoded = await jwt.verify(token, process.env.JWT_SECRET);
            console.log(decoded);
            // insert the decoded values into the USER and not DB
            // decoded will contain the information realted to the information passed as payload
            req.user = decoded;
        }
        catch (error) {
            // verifcation issue
            return res.status(401).json({
                success: false,
                message: "Token is invalid"
            })
        }

        next();

    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while validating the token",
        });
    }
}

// student
exports.isStudent = async (req, res, next) => {
    try {

        // role has been inserted in the user req URL through auth middleware
        if (req.user.accountType !== "Student") {
            return res.status(401).json({
                success: false,
                message: "This is protected route for students only"
            })
        }
        // move to the next middleWare
        next();

    }
    catch (error) {
        console.log(error);
        return res.status(401).json({
            success: false,
            message: "Student Authication not verifed"
        })
    }
}

// instructor
exports.isInstructor = async (req, res, next) => {
    try {

        // role has been inserted in the user req URL through auth middleware
        if (req.user.accountType !== "Instrutor") {
            return res.status(401).json({
                success: false,
                message: "This is protected route for Instructor only"
            })
        }

        // move to the next middleWare
        next();
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "User role can not verified"
        })
    }
}

// admin
exports.isAdmin = async (req, res, next) => {
    try {

        // role has been inserted in the user req URL through auth middleware
        if (req.user.accountType !== "Admin") {
            return res.status(401).json({
                success: false,
                message: "This is protected route for Admin only"
            })
        }
        // move to the next middleWare
        next();
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "User role can not verified"
        })
    }
}