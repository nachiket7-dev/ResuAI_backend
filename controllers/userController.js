import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Resume from "../models/resume.js";

const generateToken = (userId) => {
    //implementation for token generation
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: '7d'});
    return token;
}

// controller for user registration
// POST : /api/users/register
export const registerUser = async (req, res) => {
    try{
        const {name, email, password} = req.body;

        //check if required fields are present
        if(!name || !email || !password){
            return res.status(400).json({message: "Please fill all required fields"});
        }

        //check if user already exists
        const user = await User.findOne({email});
        if (user){
            return res.status(400).json({message: "User already exists"});
        }

        //create new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        });

        //save user to database
        await newUser.save();

        //return success message
        const token = generateToken(newUser._id);
        newUser.password = undefined; //hide password

        return res.status(201).json({
            message: "User registered successfully",
            token,
            user: newUser,
        });

    } catch (err){
        return res.status(400).json({message: err.message});
    }
}

// controller for user login
// POST : /api/users/login
export const loginUser = async (req, res) => {
    try{
        const {email, password} = req.body;

        //check if user exists
        const user = await User.findOne({email});
        if (!user){
            return res.status(400).json({message: "Invalid email or password"});
        }

        //check if password matches
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid){
            return res.status(400).json({message: "Invalid email or password"});
        }

        //return success message
        const token = generateToken(user._id);
        user.password = undefined; //hide password

        return res.status(200).json({
            message: "Login Successful",
            token,
            user,
        });

    } catch (err){
        return res.status(400).json({message: err.message});
    }
}

// controller for getting user by id
// GET : /api/users/data
export const getUserById = async (req, res) => {
    try{
        const userId = req.userId;

        //check if user exists
        const user = await User.findById(userId);
        if (!user){
            return res.status(404).json({message: "User not found"});
        }

        //return user
        user.password = undefined; //hide password
        return res.status(200).json({user});

    } catch (err){
        return res.status(400).json({message: err.message});
    }
}

//controller for getting user resumes
// GET : /api/users/resumes
export const getUserResumes = async (req, res) => {
    try{
        const userId = req.userId;

        //return user resumes
        const resumes = await Resume.find({userId});
        return res.status(200).json({resumes});

    } catch (err){
        return res.status(400).json({message: err.message});
    }
}