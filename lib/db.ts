import mongoose from "mongoose"

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI!);
        console.log("Successfully connect to mongodb");
    } catch (error) {
        console.log("Error" + error);
        process.exit(1);
    }
}

export default connectDb;
