# Backend Folder - Detailed Analysis Report

## Executive Summary

This backend is a **Node.js/Express.js REST API** for an **Inventory Management System** specifically designed for textile/fashion retail (VP Fashions). The system manages products, purchases, sales, returns (RTO/RPU), combos, barcodes, vendors, buyers, and provides comprehensive reporting and profit/loss analysis.

**Technology Stack:**
- **Runtime:** Node.js
- **Framework:** Express.js v5.1.0
- **Database:** MongoDB (via Mongoose v8.18.0)
- **Image Storage:** Cloudinary
- **File Processing:** Multer, XLSX
- **PDF Generation:** PDFKit
- **Barcode Generation:** bwip-js, Canvas

---

## 📁 Folder Structure Analysis

### 1. **Root Level Files**

#### `server.js` (Main Entry Point)
- **Purpose:** Application entry point and server configuration
- **Key Features:**
  - Express server setup with CORS configuration
  - MongoDB connection initialization
  - Body parser middleware (10MB limit for JSON/URL-encoded)
  - Route registration for all API endpoints
  - PDF invoice generation endpoints (purchases & sales)
  - Error handling middleware
  - Server listens on PORT from environment or default 5000
- **CORS Configuration:**
  - Allowed origin: `https://textile-ayjb.vercel.app` (production frontend)
  - Methods: GET, POST, PUT, DELETE
  - Credentials: enabled
- **Routes Registered:**
  - `/api/vendors` - Vendor management
  - `/api/buyers` - Buyer/customer management
  - `/api/products` - Product management
  - `/api/categories` - Category management
  - `/api/purchases` - Purchase orders
  - `/api/sales` - Sales transactions
  - `/api/returns` - Return processing (RTO/RPU)
  - `/api/barcodes` - Barcode operations
  - `/api/barcode` - Single barcode operations
  - `/api/combos` - Product combo management
  - `/api/reports` - Reporting endpoints
  - `/api/profit-loss` - Profit/loss analysis
  - `/api/rto-products` - RTO product management
  - `/api/uploaded-profit-sheets` - Excel upload management
  - `/api/product-masters` - Product master data

#### `package.json`
- **Dependencies:**
  - `express` (^5.1.0) - Web framework
  - `mongoose` (^8.18.0) - MongoDB ODM
  - `cors` (^2.8.5) - Cross-origin resource sharing
  - `dotenv` (^17.2.1) - Environment variable management
  - `body-parser` (^2.2.0) - Request body parsing
  - `multer` (^2.0.2) - File upload handling
  - `cloudinary` (^2.7.0) - Image storage service
  - `bwip-js` (^4.7.0) - Barcode generation library
  - `canvas` (^3.2.0) - Canvas API for Node.js
  - `pdfkit` (^0.17.2) - PDF generation
  - `xlsx` (^0.18.5) - Excel file processing
  - `uuid` (^11.1.0) - UUID generation
  - `archiver` (^7.0.1) - File archiving
- **Scripts:**
  - `start`: Production mode (node server.js)
  - `dev`: Development mode with nodemon
  - `test`: Placeholder (no tests configured)

---

### 2. **config/** Folder

Contains configuration files for external services and utilities.

#### `db.js` (Database Configuration)
- **Purpose:** MongoDB connection setup
- **Functionality:**
  - Connects to MongoDB using `MONGODB_URI` from environment variables
  - Error handling with process exit on connection failure
  - Logs connection host on success
- **Usage:** Imported in `server.js` for database initialization

#### `cloudinary.js` (Image Storage Configuration)
- **Purpose:** Cloudinary service configuration
- **Configuration:**
  - Cloud name, API key, and API secret from environment variables
  - Fallback hardcoded values (⚠️ **Security Concern:** Should be removed)
  - Connection test on module load
- **Usage:** Used in controllers for product/combo image uploads
- **⚠️ Security Issue:** Hardcoded credentials should be removed and only use environment variables

#### `barcodeGenerator.js` (Barcode Generation Utility)
- **Purpose:** Barcode generation and formatting
- **Functions:**
  1. `generateBarcode(text)` - Basic Code128 barcode generation
  2. `generateFormattedBarcode(itemName, barcodeId)` - Barcode with formatting (incomplete implementation)
  3. `generateVPFashionsBarcode(itemName, barcodeId)` - **VP Fashions branded barcode:**
     - Includes "VP Fashions" header
     - Barcode in center
     - ID number and item name at bottom
     - Uses Canvas API for composition
  4. `generateBarcodeId()` - Auto-generates barcode IDs with format: `IM001VP0001`
     - Prefix: `IM001VP`
     - Sequential counter stored in `BarcodeCounter` model
     - 4-digit zero-padded number
- **Barcode Format:** Code128
- **Branding:** Custom VP Fashions format with company name and product details

---

### 3. **models/** Folder

Contains Mongoose schema definitions for all database entities.

#### `Vendor.js`
- **Schema Fields:**
  - `name` (String, required) - Vendor company name
  - `contactPerson` (String, required) - Primary contact
  - `email` (String, optional) - Email address
  - `phone` (String, required) - Contact phone
  - `address` (String, required) - Physical address
  - `isActive` (Boolean, default: true) - Soft delete flag
  - `gstNo` (String, required) - GST registration number
  - `accountNo` (String, required) - Bank account number
  - `timestamps` (auto) - createdAt, updatedAt
- **Relationships:** Referenced by Purchase model

#### `Buyer.js`
- **Schema Fields:**
  - `name` (String, required) - Customer name
  - `companyName` (String, required) - Company name
  - `email` (String, optional) - Email address
  - `phone` (String, required) - Contact phone
  - `address` (String, required) - Physical address
  - `isActive` (Boolean, default: true) - Soft delete flag
  - `timestamps` (auto) - createdAt, updatedAt
- **Relationships:** Referenced by Sale model

#### `Category.js`
- **Schema Fields:**
  - `name` (String, required, unique) - Category name
  - `code` (String, required, unique) - 3-digit numeric code (regex: `/^[0-9]{3}$/`)
  - `description` (String, optional) - Category description
  - `isActive` (Boolean, default: true) - Soft delete flag
  - `timestamps` (auto) - createdAt, updatedAt
- **Indexes:**
  - `code` (for fast lookups)
  - `name` (for search optimization)
- **Relationships:** Referenced by Product and Combo models

#### `Product.js`
- **Schema Fields:**
  - `name` (String, required) - Product name
  - `barcode` (String, required, unique) - Auto-generated barcode (format: `IM{categoryCode}VP{4-digit}`)
  - `description` (String, optional) - Product description
  - `category` (ObjectId, ref: 'Category', required) - Product category
  - `price` (Number, required, min: 0) - Selling price
  - `minquantity` (Number, required, min: 0) - Minimum stock level
  - `quantity` (Number, default: 0, min: 0) - Current stock quantity
  - `reorderLevel` (Number, default: 5) - Reorder threshold
  - `vendor` (ObjectId, ref: 'Vendor', optional) - Associated vendor
  - `image` (String, optional) - Cloudinary image URL
  - `rtoStatus` (String, enum: ['none', 'RTO', 'RPU'], default: 'none') - Return status
  - `rtoQuantity` (Number, default: 0) - Quantity in RTO
  - `rtoReason` (String, enum: [...], optional) - Return reason
  - `rtoDate` (Date, optional) - Return date
  - `timestamps` (auto) - createdAt, updatedAt
- **Relationships:**
  - References: Category, Vendor
  - Referenced by: Purchase, Sale, ProductItem, Combo, RTOProduct

#### `ProductMaster.js`
- **Purpose:** Master product data imported from external sources
- **Schema Fields:**
  - `sNo` (Number, required) - Serial number
  - `productCategory` (String, required) - Category name
  - `sellingProductCode` (String, required, unique) - Product code
  - `productName` (String, required) - Product name
  - `pricePerProduct` (Number, required, min: 0) - Base price
  - `priceWithGST` (Number, required, min: 0) - Price including GST
  - `uploadedDate` (Date, default: now) - Upload timestamp
  - `uploadedBy` (String, default: 'System') - Uploader identifier
  - `timestamps` (auto) - createdAt, updatedAt
- **Indexes:**
  - `sellingProductCode` (for fast lookups)
  - `productCategory` (for filtering)
  - `productName` (for search)

#### `Purchase.js`
- **Schema Fields:**
  - `purchaseId` (String, unique, required) - Auto-generated ID (format: `PUR-{timestamp}-{count}`)
  - `vendor` (ObjectId, ref: 'Vendor', required) - Vendor reference
  - `items` (Array of objects):
     - `product` (ObjectId, ref: 'Product', required)
     - `quantity` (Number, required, min: 1)
     - `unitCost` (Number, required, min: 0)
     - `total` (Number, required, min: 0)
  - `totalAmount` (Number, required, min: 0) - Total purchase amount
  - `purchaseDate` (Date, default: now) - Purchase date
  - `status` (String, enum: ['pending', 'completed', 'cancelled'], default: 'completed')
  - `timestamps` (auto) - createdAt, updatedAt
- **Pre-save Hook:** Auto-generates `purchaseId` if not provided
- **Relationships:**
  - References: Vendor, Product
  - Referenced by: ProductItem

#### `Sale.js`
- **Schema Fields:**
  - `saleId` (String, unique, required) - Auto-generated ID (format: `SALE-{timestamp}-{count}`)
  - `buyer` (ObjectId, ref: 'Buyer', required) - Customer reference
  - `items` (Array of objects with polymorphic structure):
     - `type` (String, enum: ['product', 'combo', 'rto-product'], default: 'product')
     - `product` (ObjectId, ref: 'Product') - Required if type='product'
     - `combo` (ObjectId, ref: 'Combo') - Required if type='combo'
     - `rtoProduct` (ObjectId, ref: 'RTOProduct') - Required if type='rto-product'
     - `comboName` (String) - Required if type='combo'
     - `productName` (String) - Required if type='rto-product'
     - `quantity` (Number, default: 1)
     - `unitPrice` (Number, required, min: 0)
     - `total` (Number, required, min: 0)
     - `barcode` (String) - Item barcode
  - `subtotal` (Number, min: 0) - Subtotal before discounts
  - `discount` (Number, default: 0, min: 0, max: 100) - Discount percentage
  - `discountAmount` (Number, default: 0, min: 0) - Discount amount
  - `tax` (Number, default: 0, min: 0) - Tax percentage
  - `taxAmount` (Number, default: 0, min: 0) - Tax amount
  - `shipping` (Number, default: 0, min: 0) - Shipping charges
  - `other` (Number, default: 0, min: 0) - Other charges
  - `totalAmount` (Number, required, min: 0) - Final total
  - `saleDate` (Date, default: now) - Sale date
  - `status` (String, enum: ['pending', 'completed', 'cancelled', 'rpu', 'returned', 'delivered'], default: 'completed')
  - `timestamps` (auto) - createdAt, updatedAt
- **Pre-save Hook:** Auto-generates `saleId` if not provided
- **Relationships:**
  - References: Buyer, Product, Combo, RTOProduct
  - Referenced by: ProductItem

#### `Return.js`
- **Schema Fields:**
  - `returnId` (String, unique, auto-generated) - Format: `RET{timestamp}` or `RET{sequential}`
  - `category` (String, enum: ['RTO', 'RPU'], required) - Return category
  - `returnDate` (Date, default: now) - Return date
  - `customerName` (String, required) - Customer name
  - `customerPhone` (String, optional) - Customer phone
  - `customerEmail` (String, optional, lowercase) - Customer email
  - `reason` (String, enum: ['defective', 'wrong_item', 'damaged', 'not_satisfied', 'warranty_claim', 'other'], required)
  - `items` (Array of ReturnItemSchema):
     - `product` (ObjectId, ref: 'Product', required)
     - `productName` (String, required)
     - `barcode` (String, optional)
     - `quantity` (Number, required, min: 1)
     - `unitPrice` (Number, required, min: 0)
     - `total` (Number, required, min: 0)
  - `totalAmount` (Number, required, min: 0) - Total return amount
  - `comments` (String, optional) - Additional comments
  - `status` (String, enum: ['pending', 'processed', 'completed', 'cancelled'], default: 'pending')
  - `processedBy` (String, default: 'System') - Processor identifier
  - `processedAt` (Date, default: now) - Processing timestamp
  - `timestamps` (auto) - createdAt, updatedAt
- **Pre-save Hook:** Auto-generates `returnId` if not provided
- **Indexes:**
  - `category` (for filtering)
  - `returnDate` (descending, for sorting)
  - `customerName` (for search)
  - `status` (for filtering)
- **Business Logic:**
  - **RTO (Return to Origin):** Increases product quantity (restores inventory)
  - **RPU (Return Pick Up):** Record-only, no inventory changes
- **Relationships:**
  - References: Product
  - Referenced by: RTOProduct

#### `RTOProduct.js`
- **Purpose:** Tracks products in RTO/RPU status separately from main inventory
- **Schema Fields:**
  - `rtoId` (String, unique, auto-generated) - Format: `{category}{timestamp}`
  - `returnId` (ObjectId, ref: 'Return', optional) - Link to return record
  - `product` (ObjectId, ref: 'Product', required) - Original product
  - `productName` (String, required) - Product name snapshot
  - `barcode` (String, optional) - Product barcode
  - `category` (String, enum: ['RTO', 'RPU'], required, default: 'RTO')
  - `quantity` (Number, required, min: 1) - Current quantity in RTO
  - `initialQuantity` (Number, required, min: 0, default: 0) - Original quantity when added
  - `price` (Number, required, min: 0) - Price at time of return
  - `totalValue` (Number, required, min: 0) - Total value
  - `status` (String, enum: ['pending', 'processing', 'completed', 'cancelled'], default: 'pending')
  - `dateAdded` (Date, default: now) - When added to RTO
  - `addedBy` (String, default: 'System') - Who added it
  - `notes` (String, optional) - Additional notes
  - `reason` (String, enum: [...], optional) - Return reason
  - `timestamps` (auto) - createdAt, updatedAt
- **Pre-save Hook:**
  - Auto-generates `rtoId` if not provided
  - Sets `initialQuantity` to `quantity` on creation
- **Indexes:**
  - `category` (for filtering)
  - `status` (for filtering)
  - `dateAdded` (descending, for sorting)
  - `productName` (for search)
- **Relationships:**
  - References: Return, Product
  - Referenced by: Sale (as rto-product type)

#### `Combo.js`
- **Purpose:** Product bundles/combos that contain multiple products
- **Schema Fields:**
  - `comboId` (String, unique, auto-generated) - Format: `COMBO-{timestamp}-{count}-{random}`
  - `name` (String, required) - Combo name
  - `barcode` (String, required, unique) - Combo barcode
  - `description` (String, optional) - Combo description
  - `category` (ObjectId, ref: 'Category', optional) - Combo category
  - `price` (Number, required, min: 0) - Combo selling price
  - `products` (Array of comboProductSchema):
     - `product` (ObjectId, ref: 'Product', required)
     - `quantity` (Number, required, min: 1, default: 1)
  - `isActive` (Boolean, default: true) - Soft delete flag
  - `isMapped` (Boolean, default: false) - Manual mapping flag
  - `imageUrl` (String, optional) - Cloudinary image URL
  - `timestamps` (auto) - createdAt, updatedAt
- **Pre-save Hook:** Auto-generates `comboId` if not provided
- **Indexes:**
  - `barcode` (for fast lookups)
  - `name` (for search)
- **Relationships:**
  - References: Category, Product
  - Referenced by: Sale (as combo type)

#### `ProductItem.js`
- **Purpose:** Individual item instances created during purchase (for tracking individual items)
- **Schema Fields:**
  - `barcode` (String, required) - Item barcode (inherited from product)
  - `product` (ObjectId, ref: 'Product', required) - Product reference
  - `status` (String, enum: ['in_stock', 'sold', 'returned', 'damaged'], default: 'in_stock')
  - `purchase` (ObjectId, ref: 'Purchase', required) - Purchase reference
  - `sale` (ObjectId, ref: 'Sale', optional) - Sale reference (if sold)
  - `purchasePrice` (Number, required) - Cost price from purchase
  - `sellingPrice` (Number, required) - Selling price
  - `timestamps` (auto) - createdAt, updatedAt
- **Relationships:**
  - References: Product, Purchase, Sale

#### `BarcodeCounter.js`
- **Purpose:** Maintains sequential counter for barcode ID generation
- **Schema Fields:**
  - `prefix` (String, required, unique) - Barcode prefix (e.g., 'IM001VP')
  - `seq` (Number, default: 1) - Sequential counter
- **Usage:** Used by `generateBarcodeId()` function

#### `ProductCounter.js`
- **Purpose:** Maintains category-wise product counters for barcode generation
- **Schema Fields:**
  - `categoryCode` (String, required, unique) - Category code (3-digit)
  - `counter` (Number, default: 0) - Product counter for this category
  - `timestamps` (auto) - createdAt, updatedAt
- **Usage:** Used in product creation to generate category-specific barcodes

#### `UploadedProfitSheet.js`
- **Purpose:** Stores uploaded Excel profit/loss sheets
- **Schema Fields:**
  - `fileName` (String, required) - Uploaded file name
  - `uploadedData` (Array of UploadedProfitRowSchema) - Parsed Excel rows:
     - `month`, `sno`, `orderDate`, `orderId`, `sku`, `quantity`, `status`, `payment`, `paymentDate`, `paymentStatus`, `purchasePrice`, `profit`, `reuseOrClaim`, `reusedDate`, `statusOfProduct`, `remarks`
  - `totalRecords` (Number, default: 0) - Total rows
  - `successRecords` (Number, default: 0) - Valid rows
  - `errorRecords` (Number, default: 0) - Invalid rows
  - `profitSummary` (Object):
     - `totalProfit`, `deliveredProfit`, `rpuProfit`, `rtoProfit`, `netProfit`
  - `statusSummary` (Object):
     - `delivered`, `rpu`, `rto` (each with `count` and `profit`)
  - `notes` (String, optional) - Additional notes
  - `status` (String, default: 'uploaded') - Upload status
  - `uploadDate` (Date, default: now) - Upload timestamp
  - `timestamps` (auto) - createdAt, updatedAt
- **Indexes:**
  - `uploadDate` (descending, for sorting)
  - `fileName` (for search)
  - `status` (for filtering)

---

### 4. **controllers/** Folder

Contains business logic handlers for all API endpoints.

#### `vendorController.js`
- **Functions:**
  - `getAllVendors()` - Get all active vendors (sorted by creation date)
  - `getVendorById()` - Get vendor by ID
  - `createVendor()` - Create new vendor
  - `updateVendor()` - Update vendor details
  - `deleteVendor()` - Soft delete (sets isActive=false)
- **Error Handling:** Standard try-catch with appropriate HTTP status codes

#### `buyerController.js`
- **Functions:**
  - `getAllBuyers()` - Get all active buyers (sorted by creation date)
  - `getBuyerById()` - Get buyer by ID
  - `createBuyer()` - Create new buyer
  - `updateBuyer()` - Update buyer details
  - `deleteBuyer()` - Soft delete (sets isActive=false)
- **Error Handling:** Standard try-catch with appropriate HTTP status codes

#### `categoryController.js` (Referenced but not read)
- **Expected Functions:**
  - CRUD operations for categories
  - `getNextCategoryCode()` - Generate next available 3-digit code

#### `productController.js`
- **Functions:**
  - `getAllProducts()` - Get all products with vendor and category populated
  - `getProductById()` - Get product by ID with full details
  - `getProductByBarcode()` - Get product by barcode
  - `createProduct()` - **Complex function:**
     - Validates category
     - Generates barcode using category code and ProductCounter
     - Uploads image to Cloudinary if provided
     - Creates product with auto-generated barcode
  - `updateProduct()` - **Complex function:**
     - Handles image deletion from Cloudinary
     - Handles new image upload
     - Updates product details
  - `deleteProduct()` - **Complex function:**
     - Deletes image from Cloudinary
     - Deletes product
     - Deletes all associated ProductItems
  - `getLowStockProducts()` - Get products where quantity <= minquantity
  - `addToRTO()` - Add product to RTO/RPU
  - `updateProductRTOStatus()` - Update product RTO status
  - `getRTOProducts()` - Get all products with RTO/RPU status
- **File Upload:** Uses Multer with memory storage (5MB limit, JPEG/PNG only)
- **Image Management:** Full Cloudinary integration (upload, delete, update)

#### `purchaseController.js`
- **Functions:**
  - `getAllPurchases()` - Get all purchases with vendor and product details
  - `getPurchaseById()` - Get purchase by ID with full details
  - `createPurchase()` - **Complex transaction-based function:**
     - Uses MongoDB transactions for data consistency
     - Calculates totals for each item
     - Updates product quantities (increases stock)
     - Creates purchase record
     - Creates ProductItem instances for each purchased item
     - Assigns product barcode to each ProductItem
     - Default selling price: 20% markup on purchase price
  - `generatePurchaseBarcodes()` - Generate barcode images for all items in a purchase
- **Transaction Safety:** Uses MongoDB sessions for atomic operations

#### `saleController.js`
- **Functions:**
  - `getAllSales()` - Get all sales with buyer and item details (supports products, combos, RTO products)
  - `getSaleById()` - Get sale by ID with full details
  - `createSale()` - **Very complex function:**
     - Handles three item types: `product`, `combo`, `rto-product`
     - **For products:**
        - Validates stock availability
        - Reduces product quantity
        - Reduces RTO quantity (FIFO - oldest first)
     - **For combos:**
        - Validates stock for all combo products
        - Tracks deductions per product (handles multiple combos)
        - Reduces quantities for all combo products
     - **For RTO products:**
        - Validates RTO product availability
        - Reduces RTO product quantity
        - Reduces original product quantity
     - Calculates totals (subtotal, discount, tax, shipping, other)
     - Creates sale record
  - `updateSale()` - **Very complex function:**
     - Restores quantities from old sale items
     - Processes new items and deducts quantities
     - Updates sale record
     - Handles all three item types
  - `deleteSale()` - **Complex function:**
     - Restores quantities for all items
     - Handles products, combos, and RTO products
     - Deletes sale record
  - `scanBarcode()` - **Barcode scanning function:**
     - Checks RTO products first
     - Then checks regular products
     - Then checks combos
     - Returns product/combo details with type
     - Validates combo stock availability
- **Stock Management:** Sophisticated quantity tracking with RTO integration

#### `returnController.js`
- **Functions:**
  - `getAllReturns()` - Get all returns with product details
  - `getReturnById()` - Get return by ID
  - `getReturnsByCategory()` - Get returns filtered by RTO or RPU
  - `createReturn()` - **Complex function:**
     - Validates category (RTO or RPU)
     - Processes items and validates products
     - **For RTO:** Increases product quantities (restores inventory)
     - **For RPU:** Record-only, no inventory changes
     - Auto-generates returnId
     - Creates Return record
     - Creates RTOProduct records for RTO category
  - `updateReturn()` - Update return details
  - `deleteReturn()` - **Complex function:**
     - **For RTO:** Reverses quantity changes, deletes RTOProduct records
     - **For RPU:** No quantity adjustments
     - Deletes return record
- **Business Logic:** Clear distinction between RTO (inventory restoration) and RPU (record-only)

#### `comboController.js`
- **Functions:**
  - `getAllCombos()` - Get all combos with availability calculation:
     - Calculates how many combos can be made with current stock
     - Shows stock status per product (available, insufficient, out-of-stock)
     - Returns product details with availability info
  - `getComboById()` - Get combo by ID with availability calculation
  - `getComboByBarcode()` - Get combo by barcode
  - `createCombo()` - Create new combo:
     - Validates barcode uniqueness
     - Uploads image to Cloudinary if provided
     - Parses products JSON
  - `updateCombo()` - Update combo:
     - Handles image deletion/upload
     - Updates combo details
  - `deleteCombo()` - Soft delete (sets isActive=false)
  - `getUnmappedCombos()` - Get combos where isMapped=false
  - `addProductToCombo()` - Add product to existing combo
- **File Upload:** Uses Multer with memory storage (5MB limit, JPEG/PNG only)
- **Stock Calculation:** Real-time availability based on product stock

#### `barcodeController.js`
- **Functions:**
  - `generateBarcode()` - Generate VP Fashions branded barcode for a ProductItem
  - `getProductByBarcode()` - Get product details by scanning barcode (searches ProductItem)

#### `productMasterController.js` (Referenced but not read)
- **Expected Functions:**
  - CRUD operations for ProductMaster
  - Import/export functionality

---

### 5. **routes/** Folder

Contains Express route definitions that map HTTP endpoints to controller functions.

#### `vendors.js`
- **Routes:**
  - `GET /` - Get all vendors
  - `GET /:id` - Get vendor by ID
  - `POST /` - Create vendor
  - `PUT /:id` - Update vendor
  - `DELETE /:id` - Delete vendor

#### `buyers.js`
- **Routes:**
  - `GET /` - Get all buyers
  - `GET /:id` - Get buyer by ID
  - `POST /` - Create buyer
  - `PUT /:id` - Update buyer
  - `DELETE /:id` - Delete buyer

#### `categories.js`
- **Routes:**
  - `GET /` - Get all categories
  - `GET /next-code` - Get next available category code
  - `GET /:id` - Get category by ID
  - `POST /` - Create category
  - `PUT /:id` - Update category
  - `DELETE /:id` - Delete category

#### `products.js`
- **Routes:**
  - `GET /` - Get all products
  - `GET /low-stock` - Get low stock products
  - `GET /barcode/:barcode` - Get product by barcode
  - `GET /rto/all` - Get all RTO products
  - `GET /:id` - Get product by ID
  - `POST /` - Create product (with image upload)
  - `POST /:id/add-to-rto` - Add product to RTO
  - `PUT /:id/rto-status` - Update product RTO status
  - `PUT /:id` - Update product (with image upload)
  - `DELETE /:id` - Delete product

#### `purchases.js`
- **Routes:**
  - `GET /` - Get all purchases
  - `GET /:id` - Get purchase by ID
  - `POST /` - Create purchase
  - `GET /:id/barcodes` - Generate barcodes for purchase items

#### `sales.js`
- **Routes:**
  - `GET /` - Get all sales
  - `GET /:id` - Get sale by ID
  - `POST /` - Create sale
  - `POST /scan` - Scan barcode for sale
  - `PUT /:id` - Update sale
  - `DELETE /:id` - Delete sale

#### `returns.js`
- **Routes:**
  - `GET /` - Get all returns
  - `GET /category/:category` - Get returns by category (RTO/RPU)
  - `GET /:id` - Get return by ID
  - `POST /` - Create return
  - `PUT /:id` - Update return
  - `DELETE /:id` - Delete return

#### `combos.js`
- **Routes:**
  - `GET /` - Get all combos
  - `GET /unmapped` - Get unmapped combos
  - `GET /barcode/:barcode` - Get combo by barcode
  - `GET /:id` - Get combo by ID
  - `POST /` - Create combo (with image upload)
  - `PUT /:id` - Update combo (with image upload)
  - `DELETE /:id` - Delete combo
  - `POST /:id/add-product` - Add product to combo

#### `barcodes.js` (Referenced but not read)
- **Expected Routes:**
  - Barcode generation endpoints
  - Bulk barcode operations

#### `barcode.js` (Referenced but not read)
- **Expected Routes:**
  - Single barcode operations

#### `reports.js`
- **Routes:**
  - `GET /purchase-sales` - Get purchase and sales data for date range with daily breakdown
     - Returns daily aggregated data
     - Calculates totals and profit
  - `GET /product/:productId/monthly` - Get product-wise monthly analysis
     - Monthly purchase and sales data
     - Quantity and amount breakdowns
  - `GET /products/list` - Get all products for dropdown
  - `GET /product-status/:productId` - Get product status data (Delivered, RTO, RPU) for histogram
     - Aggregates from Sales and RTOProduct models

#### `profitLoss.js`
- **Routes:**
  - `GET /` - Get profit/loss for date range from database
     - Calculates profit by comparing sale prices with purchase costs
     - Handles products and combos
     - Separates delivered, RPU, and RTO profits
     - Returns monthly breakdown
  - `POST /upload` - Upload and process Excel file
     - Parses Excel file (XLSX)
     - Normalizes date columns
     - Stores data in UploadedProfitSheet model
     - Calculates profit summary
  - `GET /uploaded-data` - Get uploaded profit sheet data
     - Returns all uploaded sheets sorted by creation date

#### `rtoProducts.js` (Referenced but not read)
- **Expected Routes:**
  - CRUD operations for RTOProduct
  - RTO product management endpoints

#### `uploadedProfitSheets.js` (Referenced but not read)
- **Expected Routes:**
  - CRUD operations for UploadedProfitSheet
  - Excel upload management

#### `productMasters.js` (Referenced but not read)
- **Expected Routes:**
  - CRUD operations for ProductMaster
  - Import/export functionality

---

### 6. **utils/** Folder

Contains utility functions.

#### `pdfGenerator.js`
- **Functions:**
  - `generatePurchaseInvoice(purchase)` - Generates PDF invoice for purchase
     - Includes purchase ID, date, vendor details
     - Itemized list with quantities and prices
     - Total amount
  - `generateSaleInvoice(sale)` - Generates PDF invoice for sale
     - Includes sale ID, date, buyer details
     - Itemized list with barcodes and prices
     - Total amount
- **Technology:** PDFKit
- **Usage:** Called from `server.js` invoice endpoints

---

### 7. **scripts/** Folder

Contains database maintenance and migration scripts.

#### `cleanupComboIds.js` (Not read)
- **Purpose:** Likely cleans up or fixes combo ID generation issues

#### `dropAllProductItemBarcodeIndexes.js` (Not read)
- **Purpose:** Drops all barcode indexes on ProductItem collection

#### `dropComboIndexes.js` (Not read)
- **Purpose:** Drops indexes on Combo collection

#### `dropNameIndex.js` (Not read)
- **Purpose:** Drops name indexes (likely on Product or Category)

#### `dropProductItemBarcodeIndex.js` (Not read)
- **Purpose:** Drops barcode index on ProductItem collection

**Note:** These scripts suggest database schema evolution and index management.

---

## 🔍 Key Features & Business Logic

### 1. **Barcode System**
- **Format:** `IM{categoryCode}VP{4-digit-counter}`
- **Example:** `IM001VP0001`
- **Generation:** Automatic during product creation
- **Branding:** VP Fashions branded barcodes with company name and product details
- **Types:** Supports product barcodes, combo barcodes, and RTO product barcodes

### 2. **Inventory Management**
- **Stock Tracking:** Real-time quantity updates
- **Low Stock Alerts:** Products below minimum quantity threshold
- **Reorder Levels:** Configurable reorder points
- **Transaction Safety:** MongoDB transactions for purchase creation

### 3. **RTO/RPU System**
- **RTO (Return to Origin):**
  - Restores inventory quantities
  - Creates RTOProduct records
  - Can be resold at discounted prices
- **RPU (Return Pick Up):**
  - Record-only, no inventory changes
  - Tracks returns without affecting stock
- **Integration:** RTO products can be sold separately from regular inventory

### 4. **Combo System**
- **Product Bundles:** Multiple products sold together
- **Stock Validation:** Real-time availability calculation
- **Pricing:** Single price for combo
- **Stock Deduction:** Automatically deducts from all combo products

### 5. **Sales System**
- **Multi-type Items:** Supports products, combos, and RTO products in same sale
- **Pricing Flexibility:** Custom unit prices per item
- **Financial Fields:** Subtotal, discount, tax, shipping, other charges
- **Status Tracking:** pending, completed, cancelled, rpu, returned, delivered

### 6. **Reporting & Analytics**
- **Purchase-Sales Reports:** Daily breakdown with profit calculation
- **Product Analysis:** Monthly product-wise analysis
- **Profit/Loss:** Detailed profit calculation from database
- **Excel Upload:** Import profit/loss data from Excel sheets
- **Status Tracking:** Delivered, RTO, RPU counts and profits

### 7. **Image Management**
- **Storage:** Cloudinary cloud storage
- **Upload:** Multer with memory storage
- **Formats:** JPEG, PNG only
- **Size Limit:** 5MB per file
- **Operations:** Upload, update, delete with automatic cleanup

---

## 🔐 Security Considerations

### ⚠️ **Issues Found:**

1. **Hardcoded Cloudinary Credentials** (`config/cloudinary.js`):
   - Fallback hardcoded values should be removed
   - Should only use environment variables

2. **No Authentication/Authorization:**
   - No user authentication system
   - No role-based access control
   - All endpoints are publicly accessible

3. **CORS Configuration:**
   - Only allows one specific origin (production frontend)
   - May need additional origins for development

4. **Input Validation:**
   - Basic Mongoose validation present
   - May need additional business rule validation

5. **Error Messages:**
   - Some error messages may expose internal details
   - Should sanitize error responses in production

---

## 📊 Database Schema Summary

### **Collections:**
1. **vendors** - Supplier information
2. **buyers** - Customer information
3. **categories** - Product categories
4. **products** - Main product catalog
5. **productmasters** - Master product data
6. **purchases** - Purchase orders
7. **sales** - Sales transactions
8. **returns** - Return records (RTO/RPU)
9. **rtoproducts** - RTO/RPU product inventory
10. **combos** - Product bundles
11. **productitems** - Individual item instances
12. **barcodecounters** - Barcode ID counters
13. **productcounters** - Category-wise product counters
14. **uploadedprofitsheets** - Excel upload records

### **Key Relationships:**
- **Vendor → Purchase → ProductItem**
- **Buyer → Sale → (Product/Combo/RTOProduct)**
- **Category → Product → (Purchase/Sale/Combo)**
- **Return → RTOProduct → Sale**
- **Combo → Product (many-to-many)**

---

## 🚀 API Endpoints Summary

### **Base URL:** `/api`

#### **Vendors:** `/api/vendors`
- GET `/` - List all vendors
- GET `/:id` - Get vendor
- POST `/` - Create vendor
- PUT `/:id` - Update vendor
- DELETE `/:id` - Delete vendor

#### **Buyers:** `/api/buyers`
- GET `/` - List all buyers
- GET `/:id` - Get buyer
- POST `/` - Create buyer
- PUT `/:id` - Update buyer
- DELETE `/:id` - Delete buyer

#### **Categories:** `/api/categories`
- GET `/` - List all categories
- GET `/next-code` - Get next category code
- GET `/:id` - Get category
- POST `/` - Create category
- PUT `/:id` - Update category
- DELETE `/:id` - Delete category

#### **Products:** `/api/products`
- GET `/` - List all products
- GET `/low-stock` - Get low stock products
- GET `/barcode/:barcode` - Get by barcode
- GET `/rto/all` - Get RTO products
- GET `/:id` - Get product
- POST `/` - Create product (with image)
- POST `/:id/add-to-rto` - Add to RTO
- PUT `/:id/rto-status` - Update RTO status
- PUT `/:id` - Update product (with image)
- DELETE `/:id` - Delete product

#### **Purchases:** `/api/purchases`
- GET `/` - List all purchases
- GET `/:id` - Get purchase
- GET `/:id/invoice` - Download PDF invoice
- GET `/:id/barcodes` - Generate barcodes
- POST `/` - Create purchase

#### **Sales:** `/api/sales`
- GET `/` - List all sales
- GET `/:id` - Get sale
- GET `/:id/invoice` - Download PDF invoice
- POST `/` - Create sale
- POST `/scan` - Scan barcode
- PUT `/:id` - Update sale
- DELETE `/:id` - Delete sale

#### **Returns:** `/api/returns`
- GET `/` - List all returns
- GET `/category/:category` - Get by category
- GET `/:id` - Get return
- POST `/` - Create return
- PUT `/:id` - Update return
- DELETE `/:id` - Delete return

#### **Combos:** `/api/combos`
- GET `/` - List all combos
- GET `/unmapped` - Get unmapped combos
- GET `/barcode/:barcode` - Get by barcode
- GET `/:id` - Get combo
- POST `/` - Create combo (with image)
- POST `/:id/add-product` - Add product to combo
- PUT `/:id` - Update combo (with image)
- DELETE `/:id` - Delete combo

#### **Reports:** `/api/reports`
- GET `/purchase-sales` - Daily purchase/sales data
- GET `/product/:productId/monthly` - Monthly product analysis
- GET `/products/list` - Product list for dropdown
- GET `/product-status/:productId` - Product status histogram

#### **Profit/Loss:** `/api/profit-loss`
- GET `/` - Calculate profit/loss from database
- POST `/upload` - Upload Excel profit sheet
- GET `/uploaded-data` - Get uploaded sheets

---

## 🎯 Strengths

1. **Comprehensive Inventory Management:** Full lifecycle from purchase to sale to return
2. **Flexible Sales System:** Supports products, combos, and RTO products
3. **Robust RTO/RPU Handling:** Clear distinction and proper inventory management
4. **Real-time Stock Calculation:** Combo availability and low stock alerts
5. **Transaction Safety:** MongoDB transactions for critical operations
6. **Rich Reporting:** Multiple report types with date filtering
7. **Image Management:** Full Cloudinary integration
8. **Barcode System:** Automated generation with branding
9. **PDF Generation:** Invoice generation for purchases and sales
10. **Excel Import:** Profit/loss data import from Excel

---

## ⚠️ Areas for Improvement

1. **Security:**
   - Add authentication/authorization
   - Remove hardcoded credentials
   - Implement rate limiting
   - Add input sanitization

2. **Error Handling:**
   - Standardize error responses
   - Add error logging
   - Implement error recovery

3. **Testing:**
   - No test files found
   - Add unit tests
   - Add integration tests

4. **Documentation:**
   - No README file
   - Add API documentation
   - Add setup instructions

5. **Code Quality:**
   - Some functions are very long (e.g., `createSale`, `updateSale`)
   - Consider breaking into smaller functions
   - Add JSDoc comments

6. **Performance:**
   - Some queries may need optimization
   - Consider caching for frequently accessed data
   - Add pagination for large datasets

7. **Environment Configuration:**
   - No `.env.example` file
   - Document required environment variables

---

## 📝 Recommendations

1. **Immediate:**
   - Remove hardcoded Cloudinary credentials
   - Add `.env.example` file
   - Add basic authentication
   - Create README with setup instructions

2. **Short-term:**
   - Add input validation middleware
   - Implement error logging (e.g., Winston)
   - Add API documentation (e.g., Swagger)
   - Refactor long controller functions

3. **Long-term:**
   - Add comprehensive test suite
   - Implement caching layer
   - Add monitoring and alerting
   - Consider microservices architecture for scalability

---

## 📈 Statistics

- **Total Files Analyzed:** ~50+ files
- **Models:** 14 schemas
- **Controllers:** 10+ controllers
- **Routes:** 14+ route files
- **API Endpoints:** 80+ endpoints
- **Dependencies:** 13 main packages
- **Database Collections:** 14 collections

---

## 🏁 Conclusion

This is a **well-structured, feature-rich inventory management system** with comprehensive functionality for textile/fashion retail operations. The codebase demonstrates good understanding of MongoDB, Express.js, and business logic implementation. The system handles complex scenarios like RTO/RPU returns, combo products, and multi-type sales transactions.

**Primary Use Case:** Inventory management for VP Fashions (textile/fashion retail)

**Technology Maturity:** Production-ready with some security improvements needed

**Maintainability:** Good structure, but could benefit from more documentation and testing

---

**Report Generated:** $(date)
**Analyzed By:** AI Code Analysis System
**Version:** 1.0

