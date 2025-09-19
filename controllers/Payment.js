const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const { courseEnrollmentEmail } = require("../mail/template/courseEnrollermentTemplate");
const { mongo, default: mongoose } = require("mongoose");
const crypto = require('crypto');


// capture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {
    try {
        // get the courseId and userId
        const { course_id } = req.body;
        const userId = req.user.id;
        // validation
        if (!course_id) {
            return res.status(400).json({
                success: false,
                message: "Please Provide all the Details"
            })
        }

        // check if there is any course with the CourseId
        let course;
        try {
            course = await Course.findById(course_id);
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: "Could not find the course"
                })
            }

            // check if the same user Already bought the course ?
            // get the ObjectId from the UserId
            const uid = new mongoose.Types.ObjectId(userId);

            if (course.studentsEnrolled.includes(uid)) {
                return res.status(409).json({
                    success: false,
                    message: "You have already bought the course"
                })
            }

        } catch (error) {
            return res.status(404).json({
                success: false,
                message: "Could not find the course"
            })
        }

        // create the order
        const amount = course.price;
        const currency = "INR";

        const options = {
            amount: amount * 100,  // amount in paise
            currency: currency,
            receipt: `rcpt_${Math.random() * 1000}`,
            payment_capture: 1,
            // it will be used when razorpay redirects to new route after payment completed where we can use it to add the course inside the User dashboard
            notes: {
                courseId: course_id,
                userId,
            }
        };


        try {

            const paymentResponse = await instance.orders.create(options);
            console.log(paymentResponse);
            return res.status(200).json({
                success: true,
                message: "Order created Successfully",
                orderId: paymentResponse.id,
                currency: paymentResponse.currency,
                amount: paymentResponse.amount,
                courseName: course.name,
                courseDescription: course.description,
            })

        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Could not initiate order, please try again later"
            })
        }

    }
    catch (error) {

    }
}


exports.verifySignature = async (req, res) => {
    try {
        // this request is coming from raorpay site
        // used to verify 
        const webHookSecret = "12345678";

        // get the signatre send by the razorpay
        const signature = req.headers["x-razorpay-signature"];

        // signature send by the RazorPay is in hashed form for security purpose
        // we just need to convert the webHook to hashformat for comparison
        // function is : createHmac,  update, digest
        // sha256 is the hashing algo
        const shasum = crypto.createHmac("sha256", webHookSecret);

        // why Update : 
        shasum.update(JSON.stringify(req.body));

        const digest = shasum.digest("hex");

        if (digest !== signature) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed"
            })
        }

        // payment is verified
        // Now course must be visible inisdie the user who bought this course
        // since the request is made from razorpay site , we do not have anyInformation of User in request URl
        // during payment initaition we have send the notes which has courseId,userID
        const { userId, courseId } = req.body.payload.payment.entity.notes;

        // find the course and enroll the student in it
        const enrolledCourse = await Course.findByIdAndUpdate(courseId, {
            $push: { studentsEnrolled: userId },
        }, { new: true });

        if (!enrolledCourse) {
            return res.status(500).json({
                success: false,
                message: "Course not found"
            });
        }

        console.log(enrolledCourse);

        // find the student and add the course into the list of enrolled courses
        const enrolledStudent = await User.findOneAndUpdate({ _id: userId }, {
            $push: { enrolledCourses: courseId }
        }, { new: true });

        if (!enrolledStudent) {
            return res.status(500).json({
                success: false,
                message: "User not found"
            });
        }

        // Send confirmation email using the template
        const emailBody = courseEnrollmentEmail(
            enrolledStudent.firstName || "User",
            enrolledCourse.courseName || "the course"
        );
        const emailResponse = await mailSender(
            enrolledStudent.email,
            "Congratulations from CourseBundler",
            emailBody
        );

        console.log(emailResponse);
        return res.status(200).json({
            success: true,
            message: "Payment verified and course added to the user account"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Could not verify payment, please try again later"
        })
    }
}