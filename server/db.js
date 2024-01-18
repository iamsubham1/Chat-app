require('dotenv').config({ path: '.env' });

const mongoose = require('mongoose')

const MONGODB_URI = process.env.MONGODB_URI


const connectToMongo = async () => {
    try {
        await mongoose.connect(MONGODB_URI);

        console.log("Connected to MongoDB successfully");

    } catch (error) {
        console.log(error);
        process.exit();
    }
}