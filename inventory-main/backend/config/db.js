const mongoose = require('mongoose');
//const monbodburl="mongodb://localhost:27017/inventory";
const monbodburl="mongodb+srv://Amudhavan:amudhavan13@myatlasclusteredu.ednov.mongodb.net/inventory_db?retryWrites=true&w=majority"

// Cloudinary Configuration (for image uploads)
const CLOUDINARY_CLOUD_NAME = 'your_cloud_name';
const CLOUDINARY_API_KEY = 'your_api_key';
const CLOUDINARY_API_SECRET = 'your_api_secret';
//const monbodburl="mongodb+srv://loguser:Athvaitha%40%2B06@cluster0.9m18apu.mongodb.net/invent?retryWrites=true&w=majority"
//const monbodburl="mongodb+srv://vishnumanikandan:y9CF5NWxWDWErRTJ@cluster0.dt9pqrb.mongodb.net/?appName=Cluster0";
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(monbodburl);
    console.log(`MongoDB Connected: ${monbodburl}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;