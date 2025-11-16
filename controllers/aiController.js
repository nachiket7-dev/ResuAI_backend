import ai from "../configs/ai.js";
import Resume from "../models/resume.js";


// controller for enhancing a resume's professional summary using AI
// POST : /api/ai/enhance-pro-sum
export const enhanceProfessionalSummary = async (req, res) => {
    try{
        const {userContent} = req.body;

        if (!userContent){
            return res.status(400).json({message: "Missing required fields"});
        }

        const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                {
                    role: "system",
                    content: "You are an expert in resume writing. Your task is to enhance the given professional summary of a resume. The summary should be 1-2 sentences also highlighting key skills, experience, and career objectives. Make it compelling and ATS-friendly, and only return text no options or anything else."
                },
                {
                    role: "user",
                    content: userContent
                }
            ],
        })

        const enhancedContent = response.choices[0].message.content;
        return res.status(200).json({enhancedContent});
    } catch (err){
        return res.status(400).json({message: err.message});
    }
}

// controller for enhancing a resume's job description using AI
// POST : /api/ai/enhance-job-desc
export const enhanceJobDescription = async (req, res) => {
    try{
        const {userContent} = req.body;

        if (!userContent){
            return res.status(400).json({message: "Missing required fields"});
        }

        const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                {
                    role: "system",
                    content: "You are an expert in resume writing. Your task is to enhance the job description of a resume. The job description should be 1-2 sentences also highlighting key responsibilities and achievements. Use action verbs and quantifiable results where possible. Make it compelling and ATS-friendly, and only return text no options or anything else."
                },
                {
                    role: "user",
                    content: userContent
                }
            ],
        })

        const enhancedContent = response.choices[0].message.content;
        return res.status(200).json({enhancedContent});
    } catch (err){
        return res.status(400).json({message: err.message});
    }
}

// controller for uploading a resume to the database
// POST : /api/ai/upload-resume
export const uploadResume = async (req, res) => {
    try{
        const {resumeText, title} = req.body;
        const userId = req.userId;

        if (!resumeText){
            return res.status(400).json({message: "Resume text is required"});
        }

        if (!title){
            return res.status(400).json({message: "Resume title is required"});
        }

        const systemPrompt = "You are an expert AI agent to extract data from resume. Extract all information from the resume text and return it as valid JSON only, with no additional text before or after."
        const userPrompt = `Extract data from the following resume text and return as JSON in this exact format:
{
  "professionalSummary": "extracted summary text here or empty string",
  "skills": ["skill1", "skill2", "skill3"],
  "personal_info": {
    "image": "",
    "fullName": "extracted full name",
    "profession": "extracted profession",
    "email": "extracted email",
    "phone": "extracted phone",
    "location": "extracted location",
    "linkedin": "extracted linkedin url or empty string",
    "website": "extracted website url or empty string"
  },
  "experience": [
    {
      "company": "company name",
      "position": "job title",
      "start_date": "start date",
      "end_date": "end date or empty if current",
      "description": "job description",
      "is_current": false
    }
  ],
  "projects": [
    {
      "name": "project name",
      "type": "project type",
      "description": "project description"
    }
  ],
  "education": [
    {
      "institution": "school name",
      "degree": "degree type",
      "field": "field of study",
      "graduation_date": "graduation date",
      "gpa": "gpa or empty string"
    }
  ]
}

Resume text:
${resumeText}`
        const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: userPrompt
                }
            ],
            response_format: {type: 'json_object'}
        })

        const extractedData = response.choices[0].message.content;
        const parsedData = JSON.parse(extractedData);
        const newResume = await Resume.create({userId, title, ...parsedData});

        return res.json({resumeId: newResume._id});
    } catch (err){
        return res.status(400).json({message: err.message});
    }
}