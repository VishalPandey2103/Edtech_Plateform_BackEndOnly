const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageTocloudinary } = require("../utils/imageUploader");
require("dotenv").config();

const createSubSection = async (req, res) => {
    try{
        // fetch all the data from the request body
    const { title, sectionID, timeDuration, description } = req.body;
        // video will get from file -> string insert
    const video = req.files?.videoFile;
        // validation if all the field are present or not
    if (!title || !sectionID || !timeDuration || !video || !description) {
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        }
        // in Subsection we are storing the video URL as string... 
        // so first we would be required to uplad it to the cloudinary
        const uploadDetails = await uploadImageTocloudinary(
            video,
            process.env.FOLDER_NAME
        );

        // now all the data are present to create subsection
        const subSectionDetails = await SubSection.create({
            title,
            timeDuration,
            videoUrl: uploadDetails.secure_url,
            description,
        });

        // update the Section
        let updatedSection = await Section.findByIdAndUpdate(
            sectionID,
            { $push: { SubSection: subSectionDetails._id } },
            { new: true }
        );
        updatedSection = await updatedSection.populate("SubSection");

        // return the response
        return res.status(201).json({
            success: true,
            message: "SubSection created successfully",
            data: subSectionDetails,
        });


    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

const updateSubSection = async (req, res) => {
    try{
        // fetch all the details from the request body
    const { title, subSectionID, timeDuration, description } = req.body;
        // video may also get changed
    const video = req.files?.videoFile;
        // check if subSectionID is present
        if (!subSectionID) {
            return res.status(400).json({
                success: false,
                message: "subSectionID is required",
            });
        }

        // Build update object dynamically
        const updateObj = {};
        if (title !== undefined && title !== "") updateObj.title = title;
        if (timeDuration !== undefined && timeDuration !== "") updateObj.timeDuration = timeDuration;
    if (description !== undefined && description !== "") updateObj.description = description;

        // If no fields to update, return error
        if (Object.keys(updateObj).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid fields provided for Update",
            });
        }
        // If video is provided, upload it to Cloudinary
        if (video) {
            const uploadDetails = await uploadImageTocloudinary(
                video,
                process.env.FOLDER_NAME
            );
            updateObj.videoUrl = uploadDetails.secure_url;
        }

        // Update the subsection
        const updatedSubSection = await SubSection.findByIdAndUpdate(
            subSectionID,
            { $set: updateObj },
            { new: true }
        );

        if (!updatedSubSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "SubSection updated successfully",
            data: updatedSubSection,
        });

    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

const deleteSubSection = async (req, res) => {
    try {
    const { subsectionId, sectionId } = req.params; // sectionId should also be passed

        if (!subsectionId || !sectionId) {
            return res.status(400).json({
                success: false,
                message: "Subsection ID and Section ID are required"
            });
        }

    // Delete the subsection
    const deleted = await SubSection.findByIdAndDelete(subsectionId);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found"
            });
        }

        // Remove the subsection reference from the section
        await Section.findByIdAndUpdate(
            sectionId,
            { $pull: { SubSection: subsectionId } }
        );

        return res.status(200).json({
            success: true,
            message: "SubSection deleted successfully"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = {
    createSubSection,
    updateSubSection,
    deleteSubSection
};
