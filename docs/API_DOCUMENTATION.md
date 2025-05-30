# HCL Healthcare Management System - API Documentation

## Overview
Complete backend API for healthcare staff management with JWT authentication, role-based access control, and comprehensive shift scheduling with conflict detection.

## 🚀 Quick Start

### 1. Installation & Setup
```bash
# Clone and install
git clone <repository-url>
cd HCL_event
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your MongoDB connection and secrets

# Seed database with sample data
npm run seed

# Start development server
npm run dev
```

### 2. Get Started with APIs
```bash
# Login to get access token
POST http://localhost:3000/api/auth/login
{
  "email": "admin@hcl-squad11.com",
  "password": "Admin123"
}

# Use the token in subsequent requests
Authorization: Bearer <your_jwt_token>
```

---

## 🔐 Authentication Module

### Base URL: `/api/auth`

#### Login
**POST** `/api/auth/login`

**Request:**
```json
{
  "email": "admin@hcl-squad11.com",
  "password": "Admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "65f123...",
      "name": "System Administrator",
      "email": "admin@hcl-squad11.com",
      "phone": "+1234567890",
      "role": "admin",
      "active": 1
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Get Profile
**GET** `/api/auth/me`
```
Headers: Authorization: Bearer <token>
```

#### Update Password
**PUT** `/api/auth/updatepassword`
```json
{
  "currentPassword": "Admin123",
  "newPassword": "NewSecurePassword123"
}
```

---

## 👥 User Management Module

### Base URL: `/api/users`
**Authentication Required:** Admin only

#### Get All Users
**GET** `/api/users?page=1&limit=10&role=doctor&active=1`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `role`: Filter by role (admin, doctor, nurse, receptionist, pharmacist, technician)
- `active`: Filter by status (1 = active, 0 = inactive)

#### Get User by ID
**GET** `/api/users/:id`

#### Create User
**POST** `/api/users`
```json
{
  "name": "Dr. John Doe",
  "email": "john.doe@hcl-squad11.com",
  "phone": "+1234567891",
  "password": "SecurePass123",
  "role": "doctor"
}
```

#### Update User
**PUT** `/api/users/:id`
```json
{
  "name": "Dr. John Smith",
  "phone": "+1234567892",
  "role": "doctor"
}
```

#### Delete User
**DELETE** `/api/users/:id`

#### Get Users by Role
**GET** `/api/users/role/:role`

---

## 📅 Shift Management Module

### Base URL: `/api/shifts`
**Authentication Required:** Admin only

#### Get All Shifts
**GET** `/api/shifts`

**Query Parameters:**
- `page`, `limit`: Pagination
- `date`: Specific date (YYYY-MM-DD)
- `startDate`, `endDate`: Date range
- `shiftType`: Morning, Afternoon, Night
- `department`: General, Emergency, ICU, Surgery, Pediatrics, Maternity
- `status`: Open, Full, Closed

**Example:**
```bash
GET /api/shifts?department=Emergency&shiftType=Morning&date=2024-01-15
```

#### Create Shift
**POST** `/api/shifts`
```json
{
  "date": "2024-01-15",
  "shiftType": "Morning",
  "startTime": "07:00",
  "endTime": "15:00",
  "capacity": 6,
  "department": "Emergency",
  "description": "Emergency morning shift"
}
```

#### Update Shift
**PUT** `/api/shifts/:id`
```json
{
  "startTime": "08:00",
  "endTime": "16:00",
  "capacity": 8
}
```

#### Assign Staff to Shift
**POST** `/api/shifts/:id/assign`
```json
{
  "staffIds": [
    "65f123456789abcdef123457",
    "65f123456789abcdef123458"
  ]
}
```

**Features:**
- ✅ Automatic conflict detection
- ✅ Capacity validation
- ✅ Duplicate prevention
- ✅ Detailed conflict reporting

**Conflict Response (409):**
```json
{
  "success": false,
  "message": "Shift conflicts detected",
  "conflicts": [
    {
      "staffId": "65f123456789abcdef123457",
      "staffName": "Dr. John Doe",
      "conflicts": [
        {
          "shiftId": "65f123456789abcdef123459",
          "shiftType": "Morning",
          "startTime": "06:00",
          "endTime": "14:00"
        }
      ]
    }
  ]
}
```

#### Remove Staff from Shift
**PUT** `/api/shifts/:id/remove-staff`
```json
{
  "staffIds": ["65f123456789abcdef123457"]
}
```

#### Get Shifts by Date Range
**GET** `/api/shifts/date-range?startDate=2024-01-15&endDate=2024-01-21`

#### Get Staff Shifts
**GET** `/api/shifts/staff/:staffId?startDate=2024-01-15&endDate=2024-01-21`

#### Check Conflicts
**GET** `/api/shifts/conflicts?staffId=65f...&date=2024-01-15&startTime=07:00&endTime=15:00`

---

## 📊 Data Models

### User Schema
```javascript
{
  name: String,              // Full name
  phone: String,             // Contact number
  email: String,             // Unique email
  active: Number,            // 1 = active, 0 = inactive
  password: String,          // Hashed (excluded from responses)
  role: String,              // admin, doctor, nurse, receptionist, pharmacist, technician
  createdBy: Date,           // Creation timestamp
  updatedBy: Date,           // Last update timestamp
  timestamps: true           // Auto createdAt/updatedAt
}
```

### Shift Schema
```javascript
{
  date: Date,                    // Shift date
  shiftType: String,             // "Morning", "Afternoon", "Night"
  startTime: String,             // "HH:MM" (24-hour format)
  endTime: String,               // "HH:MM" (24-hour format)
  capacity: Number,              // Maximum staff capacity (1-50)
  assignedStaff: [ObjectId],     // References to User model
  department: String,            // General, Emergency, ICU, Surgery, Pediatrics, Maternity
  status: String,                // "Open", "Full", "Closed" (auto-updated)
  description: String,           // Optional description (max 500 chars)
  createdBy: ObjectId,           // Admin who created
  updatedBy: ObjectId,           // Admin who last updated
  timestamps: true               // Auto createdAt/updatedAt
}
```

### Virtual Fields
- `availableSlots`: capacity - assignedStaff.length
- `isFull`: Boolean indicating if shift is at capacity

---

## 🗂️ Database Seeding

### Master Seeder (Recommended)
```bash
# Seeds everything in correct order
npm run seed

# Development mode with auto-reload
npm run seed:dev
```

### Individual Seeders
```bash
# Admin user only
npm run seed:admin

# Shifts only (requires admin user)
npm run seed:shifts
```

### Default Admin Credentials
```
Email: admin@hcl-squad11.com
Password: Admin123
Role: admin
```

**⚠️ Important:** Change the default password after first login!

---

## 🔄 Common API Workflows

### 1. Initial Setup
```bash
# 1. Seed database
npm run seed

# 2. Start server
npm run dev

# 3. Login and get token
POST /api/auth/login
```

### 2. Create Staff Members
```bash
POST /api/users
Authorization: Bearer <admin_token>
{
  "name": "Dr. Sarah Wilson",
  "email": "sarah.wilson@hcl-squad11.com",
  "phone": "+1234567892",
  "password": "TempPass123",
  "role": "doctor"
}
```

### 3. Create and Manage Shifts
```bash
# Create shift
POST /api/shifts
{
  "date": "2024-01-20",
  "shiftType": "Morning",
  "startTime": "09:00",
  "endTime": "17:00",
  "capacity": 5,
  "department": "General"
}

# Assign staff
POST /api/shifts/:shiftId/assign
{
  "staffIds": ["<doctor_id>", "<nurse_id>"]
}
```

### 4. Monitor and Search
```bash
# Get today's shifts
GET /api/shifts?date=2024-01-20

# Get Emergency department shifts
GET /api/shifts?department=Emergency

# Get staff's schedule
GET /api/shifts/staff/:staffId?startDate=2024-01-15&endDate=2024-01-21

# Check for conflicts
GET /api/shifts/conflicts?staffId=<id>&date=2024-01-20&startTime=09:00&endTime=17:00
```

---

## ❌ Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message",
  "errors": [...]  // For validation errors
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (e.g., shift conflicts)
- `500` - Internal Server Error

### Validation Errors (400)
```json
{
  "success": false,
  "message": "Validation errors",
  "errors": [
    {
      "msg": "Start time must be in HH:MM format (24-hour)",
      "param": "startTime",
      "location": "body"
    }
  ]
}
```

---

## 🔒 Security Features

- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Password Hashing** - Bcrypt with salt rounds
- ✅ **Role-Based Access** - Admin/staff permissions
- ✅ **Input Validation** - Comprehensive request validation
- ✅ **Active User Check** - Only active users can login
- ✅ **Audit Trail** - Track who created/modified records

---

## 🚀 Business Features

### ✅ **Shift Management**
- Create shifts with custom time ranges
- Multiple departments and shift types
- Capacity management with auto-status updates
- Real-time available slots tracking

### ✅ **Conflict Detection**
- Automatic time overlap detection
- Prevents staff double-booking
- Detailed conflict reporting
- Smart assignment validation

### ✅ **Advanced Filtering**
- Date range queries
- Department and role filtering
- Status-based searches
- Staff-specific schedules

### ✅ **Data Integrity**
- Comprehensive validation
- Foreign key relationships
- Atomic operations
- Error rollback

---

## 📈 Future Roadmap

### Next Features to Implement:
1. **Attendance Management** - Mark and track attendance
2. **Daily Schedule Views** - Calendar interfaces
3. **Notification System** - Real-time alerts
4. **Reporting Dashboard** - Analytics and insights
5. **Mobile API** - Mobile app support

---

## 💡 Tips & Best Practices

### Development
```bash
# Use development scripts for auto-reload
npm run dev
npm run seed:dev

# Check API health
GET /health

# Use pagination for large datasets
GET /api/shifts?page=1&limit=20
```

### Production
- Change default admin password
- Use strong JWT_SECRET (32+ characters)
- Enable MongoDB authentication
- Set NODE_ENV=production
- Implement rate limiting
- Add request logging

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review error messages
3. Verify authentication tokens
4. Ensure database connection
5. Check console logs

**Common Issues:**
- JWT token expired → Re-login
- Validation errors → Check request format
- 404 errors → Verify endpoint URLs
- Database errors → Check MongoDB connection 