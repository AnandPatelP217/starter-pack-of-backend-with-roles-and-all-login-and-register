# 🎬 Video Editing Portal - Complete API Documentation

## 📌 Overview
This document provides a comprehensive guide to all API endpoints in the Video Editing Portal backend.

**Base URL:** `http://localhost:5000/api`

---

## 🔐 Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📍 API Endpoints

### 1️⃣ **Authentication Routes** (`/api/auth`)

#### Register Customer
```http
POST /api/auth/signup/customer
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890"
}
```

#### Register Editor
```http
POST /api/auth/signup/editor
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "name": "Jane Editor",
  "email": "jane@example.com",
  "password": "password123",
  "skills": ["color_grading", "motion_graphics"],
  "software_expertise": ["Adobe Premiere Pro", "After Effects"]
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

---

### 2️⃣ **Package Routes** (`/api/packages`)

#### Get All Packages (Public)
```http
GET /api/packages
```

#### Get Package by Name (Public)
```http
GET /api/packages/name/basic
```

#### Calculate Price (Public)
```http
GET /api/packages/calculate-price?package_name=basic&video_length=10
```

#### Create Package (Admin Only)
```http
POST /api/packages
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "basic",
  "display_name": "Basic Package",
  "description": "Perfect for simple video editing needs",
  "base_price": 499,
  "price_per_minute": 0,
  "max_video_length": 10,
  "max_file_size": 500,
  "max_revisions": 1,
  "estimated_delivery_days": 3,
  "editing_options": {
    "color_grading": false,
    "transitions": true,
    "sound_design": false
  }
}
```

---

### 3️⃣ **Project Routes** (`/api/projects`)

#### Create Project (Customer Only)
```http
POST /api/projects
Authorization: Bearer <customer_token>
Content-Type: application/json

{
  "title": "Wedding Video Edit",
  "description": "Need professional editing for my wedding video",
  "package_type": "advanced",
  "editing_instructions": "Please add romantic music and smooth transitions",
  "special_requirements": ["color grading", "slow motion effects"],
  "raw_footage": [
    {
      "upload_id": "upload_id_123",
      "filename": "wedding_raw.mp4",
      "size": 524288000
    }
  ]
}
```

#### Get My Projects (Customer)
```http
GET /api/projects/my-projects?status=in_progress
Authorization: Bearer <customer_token>
```

#### Get Editor Projects (Editor)
```http
GET /api/projects/editor/projects?status=assigned
Authorization: Bearer <editor_token>
```

#### Get All Projects (Admin)
```http
GET /api/projects/all?page=1&limit=10&status=pending_assignment
Authorization: Bearer <admin_token>
```

#### Assign Editor to Project (Admin)
```http
POST /api/projects/:projectId/assign
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "editor_id": "editor_id_123"
}
```

#### Update Project Status (Editor/Admin)
```http
PUT /api/projects/:projectId/status
Authorization: Bearer <editor_token>
Content-Type: application/json

{
  "status": "in_progress"
}
```

#### Request Revision (Customer)
```http
POST /api/projects/:projectId/revision
Authorization: Bearer <customer_token>
Content-Type: application/json

{
  "feedback": "Please adjust the color grading and add more transitions between scenes"
}
```

#### Upload Edited Video (Editor)
```http
POST /api/projects/:projectId/edited-video
Authorization: Bearer <editor_token>
Content-Type: application/json

{
  "upload_id": "upload_id_456",
  "filename": "wedding_edited_final.mp4",
  "size": 314572800
}
```

#### Add Rating (Customer)
```http
POST /api/projects/:projectId/rating
Authorization: Bearer <customer_token>
Content-Type: application/json

{
  "rating": 5,
  "feedback": "Excellent work! Exceeded my expectations."
}
```

---

### 4️⃣ **Payment Routes** (`/api/payments`)

#### Initiate Payment (Customer)
```http
POST /api/payments/initiate
Authorization: Bearer <customer_token>
Content-Type: application/json

{
  "project_id": "project_id_123",
  "payment_type": "full",
  "payment_gateway": "razorpay"
}
```

#### Verify Payment (Customer)
```http
POST /api/payments/:paymentId/verify
Authorization: Bearer <customer_token>
Content-Type: application/json

{
  "orderId": "order_xyz",
  "paymentId": "pay_abc",
  "signature": "signature_hash",
  "method": "upi"
}
```

#### Get My Payments (Customer)
```http
GET /api/payments/my-payments?status=completed
Authorization: Bearer <customer_token>
```

#### Get All Payments (Admin)
```http
GET /api/payments/all?page=1&limit=10
Authorization: Bearer <admin_token>
```

#### Process Refund (Admin)
```http
POST /api/payments/:paymentId/refund
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "refund_amount": 499,
  "refund_reason": "Project cancelled by customer request"
}
```

#### Get Revenue (Admin)
```http
GET /api/payments/revenue?start_date=2025-01-01&end_date=2025-01-31
Authorization: Bearer <admin_token>
```

---

### 5️⃣ **Payout Routes** (`/api/payouts`)

#### Get My Payouts (Editor)
```http
GET /api/payouts/my-payouts?status=completed
Authorization: Bearer <editor_token>
```

#### Get Pending Earnings (Editor)
```http
GET /api/payouts/pending-earnings
Authorization: Bearer <editor_token>
```

#### Create Payout (Admin)
```http
POST /api/payouts
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "editor_id": "editor_id_123",
  "project_ids": ["proj_1", "proj_2", "proj_3"],
  "payment_method": "bank_transfer"
}
```

#### Update Payout Status (Admin)
```http
PUT /api/payouts/:payoutId/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "completed",
  "transaction_id": "txn_xyz123",
  "reference_number": "REF123456"
}
```

---

### 6️⃣ **Message Routes** (`/api/messages`)

#### Send Message
```http
POST /api/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "project_id": "project_id_123",
  "receiver_id": "editor_id_456",
  "content": "Can you please add more transitions?",
  "message_type": "text"
}
```

#### Get Project Messages
```http
GET /api/messages/project/:projectId
Authorization: Bearer <token>
```

#### Get Unread Messages
```http
GET /api/messages/unread
Authorization: Bearer <token>
```

#### Mark Message as Read
```http
PATCH /api/messages/:messageId/read
Authorization: Bearer <token>
```

---

### 7️⃣ **Notification Routes** (`/api/notifications`)

#### Get All Notifications
```http
GET /api/notifications
Authorization: Bearer <token>
```

#### Get Unread Notifications
```http
GET /api/notifications/unread
Authorization: Bearer <token>
```

#### Get Unread Count
```http
GET /api/notifications/unread-count
Authorization: Bearer <token>
```

#### Mark as Read
```http
PATCH /api/notifications/:notificationId/read
Authorization: Bearer <token>
```

#### Mark All as Read
```http
PATCH /api/notifications/read-all
Authorization: Bearer <token>
```

---

### 8️⃣ **Admin Routes** (`/api/admin`)

#### Get All Users
```http
GET /api/admin/users?role=customer&page=1&limit=10
Authorization: Bearer <admin_token>
```

#### Get User by ID
```http
GET /api/admin/users/:userId
Authorization: Bearer <admin_token>
```

#### Suspend/Unsuspend User
```http
PATCH /api/admin/users/:userId/toggle-suspension
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "suspension_reason": "Violation of terms of service"
}
```

#### Get All Editors
```http
GET /api/admin/editors?application_status=pending
Authorization: Bearer <admin_token>
```

#### Approve Editor
```http
POST /api/admin/editors/:editorId/approve
Authorization: Bearer <admin_token>
```

#### Reject Editor
```http
POST /api/admin/editors/:editorId/reject
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "rejection_reason": "Insufficient portfolio samples"
}
```

#### Get Platform Statistics
```http
GET /api/admin/stats
Authorization: Bearer <admin_token>
```

---

### 9️⃣ **Upload Routes** (`/api/upload`)

#### Upload File
```http
POST /api/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <binary_file>
project_id: "project_id_123"
```

#### Get My Uploads
```http
GET /api/upload/my-uploads
Authorization: Bearer <token>
```

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error information"
}
```

---

## 🔑 User Roles

1. **Customer** - Can create projects, make payments, request revisions
2. **Editor** - Can work on assigned projects, upload edited videos
3. **Admin** - Full access to manage users, projects, payments, and payouts

---

## 🚀 Getting Started

1. Register as a customer
2. Browse available packages
3. Create a project with your requirements
4. Upload raw footage
5. Admin assigns an editor
6. Editor works on the project
7. Review and approve (or request revisions)
8. Make payment
9. Download final video

---

## 📝 Notes

- All timestamps are in ISO 8601 format
- File sizes are in bytes
- Prices are in INR (default currency)
- Maximum file upload size: 100MB
- Supported file types: images, videos, audio

---

## 🛡️ Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Rate limiting (5 req/15min for auth, 100 req/15min for API)
- Input validation with Joi
- Password hashing with bcrypt
- Helmet for security headers

---

## 📧 Support

For any issues or questions, please contact the development team.
