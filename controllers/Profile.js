const Profile = require("../models/Profile");
const User = require("../models/User");
const Course = require("../models/Course");
// to sechdule the deletion of user account
const schedule = require("node-schedule");

exports.updateProfile = async (req, res) => {
  try {
    // since we will be updating the Profile details...so it must also be reflected in user
    // also since the user will be logged in ...during authorization we have inserted the user id in the request 
    // contactNumber and gender are not optional
    const { dateOfBirth = "", about = "", contactNumber, gender } = req.body;

    // ge the userId from the request URl
    const userId = req.userId;

    // validate if all the required fields are present or not
    if (!contactNumber || !gender || !userId) {
      return res.status(400).json({
        success: false,
        message: "please provide the required fields"
      })
    }

    // find profile
    const userDetails = await User.findById(userId);
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }

    const profileID = userDetails.additionalDetails;

    // find the profile
    const profileDetails = await Profile.find({
      _id: profileID
    })

    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.contactNumber = contactNumber;
    profileDetails.gender = gender;

    await profileDetails.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully"
    })

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

exports.deleteAccount = async (req, res) => {
  try {
    const userID = req.userID;
    const userDetails = await User.findById(userID);

    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // schedule deletion in 7 days
    const deletionDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    schedule.scheduleJob(deletionDate, async function () {
      try {
        // unenroll user from courses
        const enrolledCourses = userDetails.courses;
        for (let courseId of enrolledCourses) {
          await Course.findByIdAndUpdate(courseId, {
            $pull: { StudentEnrolled: userDetails._id },
          });
        }

        // delete profile and user
        await Profile.findByIdAndDelete(userDetails.additionalDetails);
        await User.findByIdAndDelete(userDetails._id);

        console.log(`Deleted user ${userDetails._id}`);
      } catch (err) {
        console.error("Error deleting user:", err);
      }
    });

    return res.status(200).json({
      success: true,
      message: `Account scheduled for deletion on ${deletionDate}`,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// how can we make chnage in code such that account not get deleted  as soonas user clicks on it

exports.getAllUserDetails = async (req, res) => {
  try {
    // get id
    const id = req.user.id;

    // validation and get user details
    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec();

    // return response
    return res.status(200).json({
      success: true,
      message: "User Data fetched successfully",
      data: userDetails,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching user details",
      error: error.message,
    });
  }
};

// route handler that will return the courses enroller to the user
exports.getEnrolledCourses = async (req, res) => {
  try {

    const userId = req.userId;

    const userDetails = await User.findById({userId});

    if(!userDetails){
      return res.status(404).json({
        success:false,
        message:"Please Send the Valid User ID"
      })
    }

    // from this userID get the Courses Enrolleed
    const courses = userDetails.cou

  } catch (error) {
    console.log(error);
    return res.status.json({
      success:false,
      message:"Error while Trying to fetch all Enrolled Courses",
    })

  }
}