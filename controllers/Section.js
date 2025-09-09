const Section = require("../models/Section")
const Course = require("../models/Course")

exports.createSection = async (req,res) =>{
    try{

        // fetch the data from the request body
        // courseID is required to Update Course Schema , that is store this section into that particular course
        const {sectionName,courseID} = req.body;

        // validate if all the data are present or not
        if(!sectionName || !courseID){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        }

        // create the section
        // Section.create() returns a plain document, not a query. You cannot chain populate() directly after create()
        const newSection = await Section.create({
            sectionName:sectionName,
        });
        // populate the subsection field
        newSection = await newSection.populate("SubSection");

        // HomeWork : how to use populate such that section and subsection both get populated at same time...as Section has subsection whose ObjectId has been stored in the section document
        // Answer : use populate on the section model to populate the subsection field
        const updatedCourse = await Course.findByIdAndUpdate(courseID,{
            $push:{
                courseContent:newSection._id
            }
        },{
            new:true
        }).populate("courseContent")

        // return the updated course
        return res.status(200).json({
            success:true,
            message:"Section created successfully",
            data:updatedCourse
        })

    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

exports.updateSection = async (req,res) =>{
    try{
        // fetch all the data from the request URL
        const{sectionName,sectionID} = req.body;

        //validate if al the fields are present or not
        if(!sectionName || sectionID){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }

        // update the section
        const updatedSection = await Section.findByIdAndUpdate({sectionId},{
            sectionName:sectionName,
        })

        // there is no requirement to update the Course Sechma as ID is still same

        // return the respnse
        return res.status(200).json({
            success:true,
            message:"Section updated successfully",
            data:updatedSection,
        })

    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

exports.deleteSection = async (req,res) =>{
    try{
        // fetch all the data from req params -> assuming we are sending ID in params
        const {sectionID,courseID} = req.params;

        // validate if all the fields are present or not
        if(!sectionID || ! !courseID){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        }

        // delete
        const updatedSection = await Section.findByIdAndDelete(sectionID);

        // delete this section from the course Schema
        const updatedCourse = await Course.findByIdAndUpdate(courseID,
            {
                $pull:{
                    courseContent:sectionID
                },
            }
        )

        // return the response
        return res.status(200).json({
            success:true,
            message:"Section deleted successfully",
            data:updatedCourse
        })

    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}