# 🌱 Database Seeding Guide

## Overview
Your database has been populated with realistic fake data to showcase your video editing portal backend to clients.

## What Was Created

### 📊 Data Summary
- **1 Admin** - Platform administrator
- **8 Editors** - Professional video editors (5 available, 3 busy)
- **15 Customers** - Video editing clients
- **3 Packages** - Basic, Advanced, and Premium editing packages
- **12 Projects** - Mix of completed, in-progress, and pending projects
- **10 Payments** - Completed payment transactions
- **5 Payouts** - Editor payment disbursements
- **8 Messages** - Customer-Editor communications
- **10 Notifications** - System notifications

## 🔐 Login Credentials

### Admin Access
- **Email**: `admin@videoedit.com`
- **Password**: `Admin@123`

### Editor Accounts
- **Emails**: `editor1@videoedit.com` to `editor8@videoedit.com`
- **Password**: `Admin@123`

### Customer Accounts
- **Emails**: `customer1@testcustomer.com` to `customer15@testcustomer.com`
- **Password**: `Admin@123`

## 📦 Package Details

| Package | Price | Delivery | Features |
|---------|-------|----------|----------|
| **Basic** | ₹1,999 | 3 days | Simple editing, transitions |
| **Advanced** | ₹4,999 | 5 days | Color grading, motion graphics, sound design |
| **Premium** | ₹9,999 | 7 days | Cinema-quality, VFX, unlimited revisions |

## 🎯 Project Statuses

The seeded projects include various statuses:
- ✅ **Completed** - Finished and delivered
- 📹 **Ready for Review** - Draft uploaded, waiting for customer review
- ⚙️ **In Progress** - Editor actively working
- 👤 **Assigned** - Editor assigned, not yet started
- 📋 **Pending Assignment** - Waiting for editor assignment

## 🏃‍♂️ Running the Seeder

To re-seed the database:

```bash
node seed-realistic-data.js
```

**Warning**: This will delete all test data (emails matching `@videoedit.com` or `@testcustomer.com`) and recreate it.

## 💰 Financial Data

- **Total Revenue**: ~₹50,000 - ₹70,000
- **Editor Earnings**: 70% of project fee
- **Platform Fee**: 30% of project fee
- **Payment Gateways**: Razorpay, Stripe, PayPal (simulated)

## 📈 Demo Features Showcased

1. **Multi-Role System** ✓
   - Admin dashboard management
   - Editor workflow
   - Customer project tracking

2. **Complete Project Lifecycle** ✓
   - Project creation
   - Editor assignment
   - Draft uploads
   - Revisions
   - Final delivery
   - Payments

3. **Communication System** ✓
   - In-app messaging
   - Real-time notifications

4. **Payment Processing** ✓
   - Multiple payment gateways
   - Editor payouts
   - Financial tracking

## 🔄 Reset Data

To start fresh, simply run the seeder again:

```bash
npm run seed
```

Or directly:

```bash
node seed-realistic-data.js
```

## 📝 Notes

- All video URLs point to Cloudinary demo samples
- Transaction IDs are randomly generated
- Project dates span from Jan 2024 to present
- Editor ratings range from 4.0 to 5.0 stars
- Payment statuses are realistic (some pending, most completed)

---

**Perfect for client demos and testing!** 🚀
