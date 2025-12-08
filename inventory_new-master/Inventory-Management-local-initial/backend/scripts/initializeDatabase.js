const mongoose = require('mongoose');
require('dotenv').config();

// Import all models to ensure they're registered
const Vendor = require('../models/Vendor');
const Buyer = require('../models/Buyer');
const Category = require('../models/Category');
const Product = require('../models/Product');
const ProductMaster = require('../models/ProductMaster');
const Purchase = require('../models/Purchase');
const Sale = require('../models/Sale');
const Return = require('../models/Return');
const RTOProduct = require('../models/RTOProduct');
const Combo = require('../models/Combo');
const ProductItem = require('../models/ProductItem');
const BarcodeCounter = require('../models/BarcodeCounter');
const ProductCounter = require('../models/ProductCounter');
const UploadedProfitSheet = require('../models/UploadedProfitSheet');

const initializeDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✓ Connected to MongoDB: ${conn.connection.host}`);
    console.log(`✓ Database: ${conn.connection.name}\n`);

    const db = conn.connection.db;

    // List of all collections that should exist
    const collections = [
      'vendors',
      'buyers',
      'categories',
      'products',
      'productmasters',
      'purchases',
      'sales',
      'returns',
      'rtoproducts',
      'combos',
      'productitems',
      'barcodecounters',
      'productcounters',
      'uploadedprofitsheets'
    ];

    console.log('='.repeat(60));
    console.log('INITIALIZING DATABASE COLLECTIONS');
    console.log('='.repeat(60));

    // Create collections by inserting and deleting a dummy document
    // This ensures the collection is created with proper schema validation
    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        
        // Check if collection exists
        const collectionsList = await db.listCollections({ name: collectionName }).toArray();
        
        if (collectionsList.length === 0) {
          // Create collection by creating an empty document and deleting it
          // This ensures the collection is created with proper indexes
          await collection.insertOne({ _temp: true });
          await collection.deleteOne({ _temp: true });
          console.log(`✓ Created collection: ${collectionName}`);
        } else {
          console.log(`✓ Collection already exists: ${collectionName}`);
        }
      } catch (error) {
        console.error(`✗ Error creating collection ${collectionName}:`, error.message);
      }
    }

    // Create indexes for better performance
    console.log('\n' + '='.repeat(60));
    console.log('CREATING INDEXES');
    console.log('='.repeat(60));

    try {
      // Category indexes
      await Category.collection.createIndex({ code: 1 });
      await Category.collection.createIndex({ name: 1 });
      console.log('✓ Category indexes created');

      // Product indexes
      await Product.collection.createIndex({ barcode: 1 }, { unique: true });
      console.log('✓ Product indexes created');

      // ProductMaster indexes
      await ProductMaster.collection.createIndex({ sellingProductCode: 1 }, { unique: true });
      await ProductMaster.collection.createIndex({ productCategory: 1 });
      await ProductMaster.collection.createIndex({ productName: 1 });
      console.log('✓ ProductMaster indexes created');

      // Purchase indexes
      await Purchase.collection.createIndex({ purchaseId: 1 }, { unique: true });
      await Purchase.collection.createIndex({ purchaseDate: -1 });
      console.log('✓ Purchase indexes created');

      // Sale indexes
      await Sale.collection.createIndex({ saleId: 1 }, { unique: true });
      await Sale.collection.createIndex({ saleDate: -1 });
      console.log('✓ Sale indexes created');

      // Return indexes
      await Return.collection.createIndex({ returnId: 1 }, { unique: true });
      await Return.collection.createIndex({ category: 1 });
      await Return.collection.createIndex({ returnDate: -1 });
      await Return.collection.createIndex({ customerName: 1 });
      await Return.collection.createIndex({ status: 1 });
      console.log('✓ Return indexes created');

      // RTOProduct indexes
      await RTOProduct.collection.createIndex({ rtoId: 1 }, { unique: true });
      await RTOProduct.collection.createIndex({ category: 1 });
      await RTOProduct.collection.createIndex({ status: 1 });
      await RTOProduct.collection.createIndex({ dateAdded: -1 });
      await RTOProduct.collection.createIndex({ productName: 1 });
      console.log('✓ RTOProduct indexes created');

      // Combo indexes
      await Combo.collection.createIndex({ barcode: 1 }, { unique: true });
      await Combo.collection.createIndex({ name: 1 });
      console.log('✓ Combo indexes created');

      // BarcodeCounter indexes
      await BarcodeCounter.collection.createIndex({ prefix: 1 }, { unique: true });
      console.log('✓ BarcodeCounter indexes created');

      // ProductCounter indexes
      await ProductCounter.collection.createIndex({ categoryCode: 1 }, { unique: true });
      console.log('✓ ProductCounter indexes created');

      // UploadedProfitSheet indexes
      await UploadedProfitSheet.collection.createIndex({ uploadDate: -1 });
      await UploadedProfitSheet.collection.createIndex({ fileName: 1 });
      await UploadedProfitSheet.collection.createIndex({ status: 1 });
      console.log('✓ UploadedProfitSheet indexes created');

    } catch (error) {
      console.error('Error creating indexes:', error.message);
    }

    // List all collections
    console.log('\n' + '='.repeat(60));
    console.log('DATABASE COLLECTIONS SUMMARY');
    console.log('='.repeat(60));
    
    const allCollections = await db.listCollections().toArray();
    allCollections.forEach((collection, index) => {
      console.log(`${index + 1}. ${collection.name}`);
    });

    console.log('='.repeat(60));
    console.log(`Total Collections: ${allCollections.length}`);
    console.log('='.repeat(60));

    await mongoose.connection.close();
    console.log('\n✓ Database initialization completed successfully!');
    console.log('✓ Connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Error initializing database:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

initializeDatabase();

