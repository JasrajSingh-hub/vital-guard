# 🚀 How to Start VitalGuard AI

## Quick Start Guide

### Step 1: Install Backend Dependencies (if not done)
```bash
cd vital-guard/backend
npm install
```

### Step 2: Install Frontend Dependencies (if not done)
```bash
cd vital-guard
npm install
```

### Step 3: Start MongoDB
Make sure MongoDB is running on your system:
- **Windows**: MongoDB should be running as a service
- **Check if running**: Open MongoDB Compass or check services

If MongoDB is not installed:
- Download from: https://www.mongodb.com/try/download/community
- Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

### Step 4: Start Backend Server
Open a terminal and run:
```bash
cd vital-guard/backend
npm start
```

You should see:
```
🚀 VitalGuard AI Backend running on http://localhost:5000
📊 Database: mongodb://127.0.0.1:27017 / vitalguard
🤖 Gemini AI: Not configured (or Configured if you added API key)
```

### Step 5: Start Frontend
Open ANOTHER terminal and run:
```bash
cd vital-guard
npm run dev
```

You should see:
```
VITE v6.2.0  ready in XXX ms

➜  Local:   http://localhost:3000/
➜  Network: http://192.168.x.x:3000/
```

### Step 6: Open Browser
Go to: **http://localhost:3000**

You should see the VitalGuard AI login screen!

---

## Verification Checklist

✅ **Backend Running**: Check http://localhost:5000/api/health
- Should return: `{"success":true,"message":"VitalGuard AI Backend is running"}`

✅ **Frontend Running**: Check http://localhost:3000
- Should show role selection screen

✅ **MongoDB Connected**: Check backend terminal
- Should NOT show connection errors

---

## Quick Test

1. **Select Role**: Choose "Nurse" or "Doctor"
2. **Sign Up**: Enter name and Gmail
3. **Login**: Use same Gmail to login
4. **View Dashboard**: You should see the patient dashboard

---

## Troubleshooting

### Backend won't start
**Error**: `Cannot find package 'mongodb'`
**Fix**: Run `npm install` in `vital-guard/backend`

### MongoDB connection error
**Error**: `MongoServerError: connect ECONNREFUSED`
**Fix**: 
1. Start MongoDB service
2. Or update `.env` with MongoDB Atlas connection string

### Frontend won't start
**Error**: Module not found
**Fix**: Run `npm install` in `vital-guard`

### Port already in use
**Error**: `Port 5000 is already in use`
**Fix**: 
1. Stop other process using port 5000
2. Or change PORT in `backend/.env`

---

## Optional: Seed Database

To add sample patient data:
```bash
cd vital-guard/backend
npm run seed
```

This will create 3 sample patients with vitals, medications, and instructions.

---

## Optional: Add Gemini AI

To enable AI features:
1. Get API key from: https://ai.google.dev/
2. Add to `vital-guard/.env`:
   ```
   GEMINI_API_KEY=your_key_here
   ```
3. Add to `vital-guard/backend/.env`:
   ```
   GEMINI_API_KEY=your_key_here
   ```
4. Restart both backend and frontend

---

## Current Status

Backend is installing dependencies... ⏳

Once installation completes:
1. Backend will be ready to start
2. Frontend dependencies are already installed
3. You can follow the steps above

---

**Need Help?** Check the console output for error messages!
