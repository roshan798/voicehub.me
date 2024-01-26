import mongoose from 'mongoose';

mongoose.connect(process.env.DB_URL);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log('Connected to MongoDB successfully');
    } catch (error) {
        console.error('Error connecting to MongoDB:');
    }
};

export default connectDB;