# MongoDB Connection String Setup Guide

## Current Configuration

Your `.env` file is located at: `backend/.env`

The current MongoDB connection string on lines 12-13 is:
```
MONGODB_URI=mongodb+srv://loguser:Athvaitha%40%2B06@cluster0.9m18apu.mongodb.net/invent?retryWrites=true&w=majority
```

## How to Get Your Own MongoDB Connection String

### Method 1: MongoDB Atlas (Recommended for Production)

1. **Sign in to MongoDB Atlas**
   - Go to: https://cloud.mongodb.com/
   - Log in with your account

2. **Select Your Cluster**
   - Click on your cluster name
   - If you don't have a cluster, create one (Free tier available)

3. **Get Connection String**
   - Click the **"Connect"** button
   - Select **"Connect your application"**
   - Choose **"Node.js"** as the driver
   - Copy the connection string

4. **Update Connection String**
   - Replace `<password>` with your database user password
   - Replace `<database>` with your database name (e.g., `invent`, `inventory_db`)
   - Example format:
     ```
     mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/YOUR_DATABASE?retryWrites=true&w=majority
     ```

5. **Create Database User (if needed)**
   - Go to **"Database Access"** in the left menu
   - Click **"Add New Database User"**
   - Choose **"Password"** authentication
   - Enter username and password
   - Set user privileges (Read and write to any database)
   - Click **"Add User"**

6. **Whitelist IP Address**
   - Go to **"Network Access"** in the left menu
   - Click **"Add IP Address"**
   - Click **"Add Current IP Address"** or **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Click **"Confirm"**

### Method 2: Local MongoDB (For Development)

If you're running MongoDB locally:

1. **Install MongoDB** (if not installed)
   - Download from: https://www.mongodb.com/try/download/community
   - Install and start MongoDB service

2. **Use Local Connection String**
   ```
   MONGODB_URI=mongodb://localhost:27017/inventory_db
   ```

### Method 3: MongoDB Compass Connection String

If you're using MongoDB Compass:

1. Open MongoDB Compass
2. Connect to your database
3. Copy the connection string from the connection dialog
4. Use that string in your `.env` file

## Updating Your .env File

1. **Open the file**: `backend/.env`

2. **Find line 12-13** (MONGODB_URI)

3. **Replace with your connection string**:
   ```env
   MONGODB_URI=your_connection_string_here
   ```

4. **Important Notes**:
   - If your password contains special characters, URL-encode them:
     - `@` becomes `%40`
     - `+` becomes `%2B`
     - `#` becomes `%23`
     - etc.
   - Keep the connection string on a single line
   - Don't add quotes around the connection string
   - Make sure there are no spaces

## Example .env File Structure

```env
# Backend Environment Variables

# Server Configuration
PORT=5000

# MongoDB Database Connection
# For production (MongoDB Atlas):
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/invent?retryWrites=true&w=majority

# For local development:
# MONGODB_URI=mongodb://localhost:27017/inventory_db

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME="dpebzsbtj"
CLOUDINARY_API_KEY="317852785236772"
CLOUDINARY_API_SECRET="GQO2xD1SO-hYiJjzl54CPPK_lTQ"

BARCODE_PREFIX=INV
DEFAULT_PAGINATION_LIMIT=10
```

## Testing Your Connection

After updating the connection string:

1. **Start your backend server**:
   ```bash
   cd backend
   npm start
   ```

2. **Check the console output**:
   - You should see: `MongoDB Connected: cluster0.xxxxx.mongodb.net`
   - If you see an error, check:
     - Username and password are correct
     - IP address is whitelisted
     - Database name is correct
     - Network connectivity

## Common Issues

### Issue: "Authentication failed"
- **Solution**: Check username and password are correct
- Make sure password is URL-encoded if it contains special characters

### Issue: "IP not whitelisted"
- **Solution**: Add your IP address in MongoDB Atlas Network Access

### Issue: "Connection timeout"
- **Solution**: Check your internet connection
- Verify the cluster is running in MongoDB Atlas

### Issue: "Database not found"
- **Solution**: MongoDB will create the database automatically on first use
- Or create it manually in MongoDB Atlas

## Security Best Practices

1. **Never commit `.env` file to Git**
   - Make sure `.env` is in `.gitignore`

2. **Use strong passwords**
   - At least 12 characters
   - Mix of letters, numbers, and symbols

3. **Limit IP access**
   - Only whitelist necessary IP addresses
   - Avoid using `0.0.0.0/0` in production

4. **Use environment-specific connection strings**
   - Different strings for development, staging, and production

## Need Help?

- MongoDB Atlas Documentation: https://docs.atlas.mongodb.com/
- MongoDB Connection String Format: https://docs.mongodb.com/manual/reference/connection-string/
- MongoDB Community Forum: https://developer.mongodb.com/community/forums/

