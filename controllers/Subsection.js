const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const cloudinary = require("../utils/cloudinary");
require("dotenv").config();

//create the subsection
exports.createSubsection = async (req,res) =>{
    try{
        // fetch all the data from the request body
        const {title,sectionID,timeDuration,Description} = req.body;
        // video will get from file -> string insert
        const video = req.file.videoFile;
        // validation if all the field are present or not
        if(!title || !  sectionID || !timeDuration || !video || !Description){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        }
        // in Subsection we are storing the video URL as string... 
        // so first we would be required to uplad it to the cloudinary
        const uploadDetails = await cloudinary.uploader.upload(video, {
            folder: process.env.FOLDER_NAME
        })

        // now all the data are present ot create sbsection
        const subSectionDetails = await SubSection.create({
            title:title,
            timeDuration:timeDuration,
            videoUrl:uploadDetails.secure_url,
            description:Description,
        })

        // update the Section
        const updatedSection = await Section.findByIdAndUpdate({sectionId},{
            $push: {SubSection: subSectionDetails._id}
        },{new:true})

        updatedSection = await updatedSection.populate("SubSection")

        // return the response
        return res.status(201).json({
            success:true,
            message:"SubSection created successfully",
            data:subSectionDetails,
        })


    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

// Controller for Updating the subsection
exports.updateSubsection = async (req,res) =>{
    try{
        // fetch all the details from the request body
        const { title, subSectionID, timeDuration, Description } = req.body;
        // video may also get changed
        const video = req.file.videoFile;
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
        if (Description !== undefined && Description !== "") updateObj.description = Description;

        // If no fields to update, return error
        if (Object.keys(updateObj).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid fields provided for Update",
            });
        }
        // If video is provided, upload it to Cloudinary
        if (video) {
            const uploadDetails = await cloudinary.uploader.upload(video, {
                folder: process.env.FOLDER_NAME
            });
            updateObj.videoUrl = uploadDetails.secure_url;
        }

        // Update the subsection
        const updatedSubSection = await SubSection.findByIdAndUpdate(
            subSectionID,
            { $set: updateObj }, // This ensures that only the provided fields are changed, and all other fields in the document remain unchanged.
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


// delete Subsecton