const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import all models
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

// Old database connection string (invent database)
const OLD_DB_URI = 'mongodb+srv://loguser:Athvaitha%40%2B06@cluster0.9m18apu.mongodb.net/invent?retryWrites=true&w=majority';

// New database connection string (from .env)
const NEW_DB_URI = process.env.MONGODB_URI;

const migrateData = async () => {
  let oldConnection = null;
  let newConnection = null;

  try {
    console.log('='.repeat(70));
    console.log('DATA MIGRATION: OLD DATABASE → NEW DATABASE');
    console.log('='.repeat(70));

    // Connect to old database
    console.log('\n📡 Connecting to OLD database (invent)...');
    oldConnection = await mongoose.createConnection(OLD_DB_URI);
    await oldConnection.asPromise(); // Wait for connection to be ready
    const oldDb = oldConnection.db;
    console.log(`✓ Connected to OLD database: ${oldConnection.host || 'cluster0.9m18apu.mongodb.net'}`);
    console.log(`✓ Database: ${oldDb.databaseName || 'invent'}`);

    // Connect to new database
    console.log('\n📡 Connecting to NEW database (inventory_db)...');
    newConnection = await mongoose.createConnection(NEW_DB_URI);
    await newConnection.asPromise(); // Wait for connection to be ready
    const newDb = newConnection.db;
    console.log(`✓ Connected to NEW database: ${newConnection.host || 'myatlasclusteredu.ednov.mongodb.net'}`);
    console.log(`✓ Database: ${newDb.databaseName || 'inventory_db'}`);

    // Collection mapping
    const collections = [
      { model: 'Vendor', oldCollection: 'vendors', newCollection: 'vendors' },
      { model: 'Buyer', oldCollection: 'buyers', newCollection: 'buyers' },
      { model: 'Category', oldCollection: 'categories', newCollection: 'categories' },
      { model: 'Product', oldCollection: 'products', newCollection: 'products' },
      { model: 'ProductMaster', oldCollection: 'productmasters', newCollection: 'productmasters' },
      { model: 'Purchase', oldCollection: 'purchases', newCollection: 'purchases' },
      { model: 'Sale', oldCollection: 'sales', newCollection: 'sales' },
      { model: 'Return', oldCollection: 'returns', newCollection: 'returns' },
      { model: 'RTOProduct', oldCollection: 'rtoproducts', newCollection: 'rtoproducts' },
      { model: 'Combo', oldCollection: 'combos', newCollection: 'combos' },
      { model: 'ProductItem', oldCollection: 'productitems', newCollection: 'productitems' },
      { model: 'BarcodeCounter', oldCollection: 'barcodecounters', newCollection: 'barcodecounters' },
      { model: 'ProductCounter', oldCollection: 'productcounters', newCollection: 'productcounters' },
      { model: 'UploadedProfitSheet', oldCollection: 'uploadedprofitsheets', newCollection: 'uploadedprofitsheets' }
    ];

    console.log('\n' + '='.repeat(70));
    console.log('STARTING DATA MIGRATION');
    console.log('='.repeat(70));

    let totalMigrated = 0;
    let totalSkipped = 0;

    for (const collection of collections) {
      try {
        const oldCollection = oldDb.collection(collection.oldCollection);
        const newCollection = newDb.collection(collection.newCollection);

        // Check if collection exists in old database
        const oldCollections = await oldDb.listCollections({ name: collection.oldCollection }).toArray();
        
        if (oldCollections.length === 0) {
          console.log(`⏭️  Skipping ${collection.oldCollection} (does not exist in old database)`);
          totalSkipped++;
          continue;
        }

        // Count documents in old collection
        const oldCount = await oldCollection.countDocuments();
        
        if (oldCount === 0) {
          console.log(`⏭️  Skipping ${collection.oldCollection} (empty collection)`);
          totalSkipped++;
          continue;
        }

        console.log(`\n📦 Migrating ${collection.oldCollection}...`);
        console.log(`   Found ${oldCount} documents`);

        // Fetch all documents from old collection
        const documents = await oldCollection.find({}).toArray();

        if (documents.length === 0) {
          console.log(`   ⚠️  No documents to migrate`);
          totalSkipped++;
          continue;
        }

        // Check existing documents in new collection
        const existingCount = await newCollection.countDocuments();
        
        if (existingCount > 0) {
          console.log(`   ⚠️  New collection already has ${existingCount} documents`);
          console.log(`   💡 Options:`);
          console.log(`      1. Skip this collection (keeping existing data)`);
          console.log(`      2. Merge data (insert only new documents)`);
          console.log(`      3. Replace all data (delete existing and insert new)`);
          
          // For now, we'll merge (insert only if _id doesn't exist)
          let inserted = 0;
          let skipped = 0;
          
          for (const doc of documents) {
            const exists = await newCollection.findOne({ _id: doc._id });
            if (!exists) {
              await newCollection.insertOne(doc);
              inserted++;
            } else {
              skipped++;
            }
          }
          
          console.log(`   ✓ Inserted ${inserted} new documents`);
          if (skipped > 0) {
            console.log(`   ⏭️  Skipped ${skipped} duplicate documents`);
          }
          totalMigrated += inserted;
        } else {
          // Insert all documents
          if (documents.length > 0) {
            await newCollection.insertMany(documents, { ordered: false });
            console.log(`   ✓ Migrated ${documents.length} documents`);
            totalMigrated += documents.length;
          }
        }

      } catch (error) {
        console.error(`   ✗ Error migrating ${collection.oldCollection}:`, error.message);
        // Continue with next collection
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('MIGRATION SUMMARY');
    console.log('='.repeat(70));
    console.log(`✓ Total documents migrated: ${totalMigrated}`);
    console.log(`⏭️  Collections skipped: ${totalSkipped}`);
    console.log('='.repeat(70));

    // Verify migration
    console.log('\n📊 Verifying migration...');
    for (const collection of collections) {
      try {
        const oldCollection = oldDb.collection(collection.oldCollection);
        const newCollection = newDb.collection(collection.newCollection);
        
        const oldCount = await oldCollection.countDocuments();
        const newCount = await newCollection.countDocuments();
        
        if (oldCount > 0) {
          console.log(`   ${collection.oldCollection}: ${oldCount} → ${newCount} documents`);
        }
      } catch (error) {
        // Ignore errors
      }
    }

    // Close connections
    await oldConnection.close();
    await newConnection.close();
    
    console.log('\n✅ Data migration completed successfully!');
    console.log('✅ Connections closed.');
    process.exit(0);

  } catch (error) {
    console.error('\n✗ Error during migration:', error.message);
    console.error('Stack:', error.stack);
    
    // Close connections if they exist
    if (oldConnection) await oldConnection.close().catch(() => {});
    if (newConnection) await newConnection.close().catch(() => {});
    
    process.exit(1);
  }
};

// Run migration
migrateData();

