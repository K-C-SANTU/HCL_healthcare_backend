# HCL Healthcare Management System

A comprehensive backend API for healthcare staff management with JWT authentication, role-based access control, shift scheduling, attendance tracking, and leave management.

## 🚀 Features

- **Authentication & Security** - JWT authentication with role-based access control
- **Staff Management** - Complete CRUD operations for healthcare staff
- **Shift Management** - Advanced scheduling with conflict detection and time overlap prevention
- **Attendance Tracking** - Daily attendance management with multiple status options
- **Leave Management** - Complete leave application workflow with approval system

## 📋 Quick Setup

### 1. Installation
```bash
git clone <repository-url>
cd HCL_event
npm install
```

### 2. Environment Configuration
```env
MONGO_URI=mongodb://localhost:27017/hcl_healthcare
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d
PORT=3000
NODE_ENV=development
```

### 3. Database Setup
```bash
npm run seed
```

### 4. Start Server
```bash
npm run dev
```

## 🔐 Default Admin Credentials
```
Email: admin@hcl-squad11.com
Password: Admin123
```

## 📚 API Documentation

**Swagger UI**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

### API Endpoints

| Module | Base URL | Description |
|--------|----------|-------------|
| Authentication | `/api/auth` | Login, profile, password management |
| Users | `/api/users` | Staff management (Admin only) |
| Shifts | `/api/shifts` | Shift scheduling and assignment |
| Attendance | `/api/attendance` | Daily attendance tracking |
| Leaves | `/api/leaves` | Leave application and approval |

### Authentication
All protected endpoints require JWT Bearer token:
```
Authorization: Bearer <your_jwt_token>
```

## 🗂️ Data Models

### User Model
```javascript
{
  name: String,           // Full name
  email: String,          // Unique email
  phone: String,          // Contact number
  password: String,       // Hashed password
  role: String,           // admin, doctor, nurse, receptionist, pharmacist, technician
  active: Number,         // 1 = active, 0 = inactive
  createdAt: Date,
  updatedAt: Date
}
```

### Shift Model
```javascript
{
  shiftType: String,             // Morning, Afternoon, Night
  startTime: String,             // HH:MM format
  endTime: String,               // HH:MM format
  requiredStaff: Number,         // Maximum staff slots
  assignedStaff: [ObjectId],     // Array of User IDs
  department: String,            // General, Emergency, ICU, Surgery, Pediatrics, Maternity
  status: String,                // Open, Full, Closed
  description: String,           // Optional notes
  createdBy: ObjectId,
  updatedBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Attendance Model
```javascript
{
  staffId: ObjectId,             // Reference to User
  shiftId: ObjectId,             // Reference to Shift
  date: Date,                    // Attendance date
  status: String,                // Present, Absent, Late, Sick Leave, Emergency Leave, Half Day
  checkInTime: String,           // HH:MM format
  checkOutTime: String,          // HH:MM format
  totalHours: Number,            // Calculated working hours
  isLate: Boolean,               // Auto-calculated
  remarks: String,               // Additional notes
  leaveId: ObjectId,             // Reference to Leave (if applicable)
  markedBy: ObjectId,            // Admin who marked attendance
  createdAt: Date,
  updatedAt: Date
}
```

### Leave Model
```javascript
{
  staffId: ObjectId,             // Reference to User
  leaveType: String,             // Sick, Vacation, Emergency, Maternity, Paternity, Personal, Compensatory, Bereavement
  startDate: Date,               // Leave start date
  endDate: Date,                 // Leave end date
  totalDays: Number,             // Calculated duration
  reason: String,                // Leave reason
  status: String,                // Pending, Approved, Rejected, Cancelled
  isEmergency: Boolean,          // Emergency leave flag
  appliedDate: Date,
  reviewedDate: Date,
  reviewedBy: ObjectId,          // Admin who reviewed
  reviewComments: String,
  handoverNotes: String,
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  replacementStaff: [{
    shiftId: ObjectId,
    staffId: ObjectId
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## 🏥 System Configuration

### Departments
- General, Emergency, ICU, Surgery, Pediatrics, Maternity

### User Roles
- `admin` - Full system access
- `doctor` - Medical staff
- `nurse` - Nursing staff
- `receptionist` - Front desk staff
- `pharmacist` - Pharmacy staff
- `technician` - Technical staff

### Leave Types
- Sick Leave, Vacation, Emergency, Maternity, Paternity, Personal, Compensatory, Bereavement

### Attendance Status
- Present, Absent, Late, Sick Leave, Emergency Leave, Half Day

## 🔄 Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Production server |
| `npm run dev` | Development server with auto-reload |
| `npm run seed` | Seed database with sample data |
| `npm run seed:admin` | Create admin user only |

## 🛡️ Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based authorization
- Input validation with express-validator
- Active user verification
- Audit trail for record tracking

## 📊 Key Features

### Shift Management
- Time overlap detection
- Automatic conflict resolution
- Staff assignment validation
- Real-time slot tracking

### Attendance System
- Multiple status options
- Automatic late detection
- Integration with leave system
- Statistical reporting

### Leave Management
- Multi-step approval workflow
- Emergency leave handling
- Replacement staff assignment
- Team calendar integration

---

**API Documentation**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
