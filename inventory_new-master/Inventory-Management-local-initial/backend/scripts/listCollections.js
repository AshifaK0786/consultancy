const mongoose = require('mongoose');
require('dotenv').config();

const listCollections = async () => {
  try {
    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Connected to MongoDB: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}\n`);

    // Get all collections
    const db = conn.connection.db;
    const collections = await db.listCollections().toArray();

    console.log('='.repeat(50));
    console.log('COLLECTIONS IN DATABASE:');
    console.log('='.repeat(50));
    
    if (collections.length === 0) {
      console.log('No collections found in the database.');
    } else {
      collections.forEach((collection, index) => {
        console.log(`${index + 1}. ${collection.name}`);
      });
    }

    console.log('='.repeat(50));
    console.log(`Total Collections: ${collections.length}`);
    console.log('='.repeat(50));

    // Get collection statistics
    console.log('\nCollection Statistics:');
    console.log('-'.repeat(50));
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`${collection.name}: ${count} documents`);
    }

    await mongoose.connection.close();
    console.log('\nConnection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

listCollections();

