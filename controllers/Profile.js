const Profile = require("../models/Profile");
const User = require("../models/User");
const Course = require("../models/Course");
// to schedule the deletion of user account
const schedule = require("node-schedule");

exports.updateProfile = async (req, res) => {
  try {
    // since we will be updating the Profile details...so it must also be reflected in user
    // also since the user will be logged in ...during authorization we have inserted the user id in the request 
    // contactNumber and gender are not optional
    const { dateOfBirth = "", about = "", contactNumber, gender } = req.body;

  // get the userId from the request URL
  const userId = req.user.id;

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


    // find the profile as an object
    const profileDetails = await Profile.findById(profileID);
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


// route handler that will return the courses enrolled by the user
exports.getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id; // use req.user.id

    const userDetails = await User.findById(userId)
      .populate({
        path: "courses",
        populate: {
          path: "instructor",
          select: "firstName lastName email",
        },
      })
      .exec();

    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "Please send a valid User ID",
      });
    }

    // Return empty array if no courses
    return res.status(200).json({
      success: true,
      data: userDetails.courses || [],
    });
  } catch (error) {
    console.error("Error while trying to fetch enrolled courses:", error);
    return res.status(500).json({
      success: false,
      message: "Error while trying to fetch enrolled courses",
      error: error.message,
    });
  }
};

exports.updateDisplayPicture = async (req, res) => {
  try {
    const userId = req.user.id;
    const image = req.files?.profileimage;

    if (!userId || !image) {
      return res.status(400).json({
        success: false,
        message: "Please provide user ID and profile image",
      });
    }

    // Upload image to Cloudinary
    const profileImage = await uploadImageToCloudinary(
      image,
      process.env.FOLDER_NAME
    );

    if (!profileImage || !profileImage.secure_url) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload image",
      });
    }

    // Find and update user
    const userDetails = await User.findById(userId);
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    userDetails.image = profileImage.secure_url;
    await userDetails.save();

    return res.status(200).json({
      success: true,
      message: "User profile picture updated successfully",
      imageUrl: userDetails.image,
    });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    return res.status(500).json({
      success: false,
      message: `Error while updating profile picture: ${error.message}`,
    });
  }
};