import mongoose from "mongoose";

const connectDB = async () => {
    try{
        mongoose.connection.on("connected",() => {
            console.log("database connected successfully");
        })
        let mongodbUri = process.env.MONGODB_URI;

        const projectName = 'resume-builder'

        if (!mongodbUri){
            throw new Error('MONGODB_URI environment variables not set');
        }

        if (mongodbUri.endsWith('/')){
            mongodbUri = mongodbUri.slice(0, -1);
        }

        await mongoose.connect(`${mongodbUri}/${projectName}`);

    } catch(err){
        console.error("Error connecting to MongoDB:", err);
    }
}

export default connectDB;