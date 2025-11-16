import imagekit from "../configs/imageKit.js";
import Resume from "../models/resume.js";
import fs from "fs";


//controller for creating a new resume
// POST : /api/resumes/create
export const createResume = async (req, res) => {
    try{
        const userId = req.userId;
        const {title} = req.body;

        // create a new resume 
        const newResume = new Resume({userId,title});

        //save resume to database
        await newResume.save();

        //return success message
        return res.status(201).json({
            message: "Resume created successfully",
            resume: newResume
        });

    } catch (err){
        return res.status(400).json({message: err.message});
    }
}

//controller for deleting a resume
// DELETE : /api/resumes/delete
export const deleteResume = async (req, res) => {
    try{
        const userId = req.userId;
        const {resumeId} = req.params;

        await Resume.findOneAndDelete({userId, _id: resumeId});
        //return success message
        return res.status(200).json({
            message: "Resume deleted successfully",
        });

    } catch (err){
        return res.status(400).json({message: err.message});
    }
}

//controller for getting resume by id
// GET : /api/resumes/get
export const getResumeById = async (req, res) => {
    try{
        const userId = req.userId;
        const {resumeId} = req.params;

        const resume = await Resume.findOne({userId, _id: resumeId});

        if (!resume){
            return res.status(404).json({message: "Resume not found"});
        }

        // Convert camelCase field names to snake_case for frontend compatibility
        const resumeData = resume.toObject();
        if (resumeData.professionalSummary !== undefined) {
            resumeData.professional_summary = resumeData.professionalSummary;
            delete resumeData.professionalSummary;
        }
        if (resumeData.accentColor !== undefined) {
            resumeData.accent_color = resumeData.accentColor;
            delete resumeData.accentColor;
        }
        if (resumeData.projects !== undefined) {
            resumeData.project = resumeData.projects;
            delete resumeData.projects;
        }

        resumeData.__v = undefined; //hide version key
        resumeData.createdAt = undefined; //hide createdAt
        resumeData.updatedAt = undefined; //hide updatedAt
        //return success message
        return res.status(200).json({resume: resumeData});

    } catch (err){
        return res.status(400).json({message: err.message});
    }
}

//controller for getting a resume by id public
// GET : /api/resumes/public
export const getPublicResumeById = async (req, res) => {
    try{
        const {resumeId} = req.params;

        const resume = await Resume.findOne({ public: true, _id: resumeId});

        if (!resume){
            return res.status(404).json({message: "Resume not found or not public"});
        }
        
        // Convert camelCase field names to snake_case for frontend compatibility
        const resumeData = resume.toObject();
        if (resumeData.professionalSummary !== undefined) {
            resumeData.professional_summary = resumeData.professionalSummary;
            delete resumeData.professionalSummary;
        }
        if (resumeData.accentColor !== undefined) {
            resumeData.accent_color = resumeData.accentColor;
            delete resumeData.accentColor;
        }
        if (resumeData.projects !== undefined) {
            resumeData.project = resumeData.projects;
            delete resumeData.projects;
        }
        
        return res.status(200).json({resume: resumeData});
    } catch (err){
        return res.status(400).json({message: err.message});
    }
}

//controller for updating a resume
// PUT : /api/resumes/update
export const updateResume = async (req, res) => {
    try{
        const userId = req.userId;
        const {resumeId, resumeData, removeBackground} = req.body;
        const image = req.file;

        let resumeDataCopy;
        if (typeof resumeData === 'string'){
            resumeDataCopy = JSON.parse(resumeData);
        }else{
            resumeDataCopy = structuredClone(resumeData);
        }

        // Convert snake_case field names to camelCase to match schema
        if (resumeDataCopy.professional_summary !== undefined) {
            resumeDataCopy.professionalSummary = resumeDataCopy.professional_summary;
            delete resumeDataCopy.professional_summary;
        }
        if (resumeDataCopy.accent_color !== undefined) {
            resumeDataCopy.accentColor = resumeDataCopy.accent_color;
            delete resumeDataCopy.accent_color;
        }
        if (resumeDataCopy.project !== undefined) {
            resumeDataCopy.projects = resumeDataCopy.project;
            delete resumeDataCopy.project;
        }

        if (image){
            const imageBufferData = fs.createReadStream(image.path);

            const response = await imagekit.files.upload({
                file: imageBufferData,
                fileName: 'resume.jpg',
                folder: 'user-resumes',
                transformation: {
                    pre: 'w-300,h-300,fo-face,z-0.75' + (removeBackground ? ',e-bgremove' : '')
                }
              });
            resumeDataCopy.personal_info.image = response.url;
        }

        const resume = await Resume.findOneAndUpdate(
            {userId, _id: resumeId},
            resumeDataCopy,
            {new: true}
        );
        
        // Convert camelCase field names back to snake_case for frontend compatibility
        const resumeResponse = resume.toObject();
        if (resumeResponse.professionalSummary !== undefined) {
            resumeResponse.professional_summary = resumeResponse.professionalSummary;
            delete resumeResponse.professionalSummary;
        }
        if (resumeResponse.accentColor !== undefined) {
            resumeResponse.accent_color = resumeResponse.accentColor;
            delete resumeResponse.accentColor;
        }
        if (resumeResponse.projects !== undefined) {
            resumeResponse.project = resumeResponse.projects;
            delete resumeResponse.projects;
        }
        
        return res.status(200).json({
            message: "Saved successfully",
            resume: resumeResponse,
        });

    } catch (err){
        return res.status(400).json({message: err.message});
    }
}