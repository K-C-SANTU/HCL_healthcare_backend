# HCL Healthcare Management System

A comprehensive backend API for healthcare staff management with JWT authentication, role-based access control, advanced shift scheduling with automatic conflict detection, attendance tracking, and leave management system.

## 🚀 Features

### ✅ **Authentication & Security**
- **JWT Authentication** - Secure login with token-based authentication
- **Role-Based Access Control** - Admin, Doctor, Nurse, Receptionist, Pharmacist, Technician roles
- **Password Security** - Bcrypt hashing with salt rounds
- **Input Validation** - Comprehensive request validation with express-validator
- **Active User Management** - Account activation/deactivation

### ✅ **Staff Management**
- **User CRUD Operations** - Complete staff member management
- **Role-Based Filtering** - Filter staff by department and role
- **Pagination Support** - Efficient data loading
- **Search Functionality** - Find staff quickly

### ✅ **Advanced Shift Management** 
- **Custom Time Ranges** - Create shifts with specific start/end times
- **Multi-Department Support** - General, Emergency, ICU, Surgery, Pediatrics, Maternity
- **Shift Types** - Morning, Afternoon, Night shifts
- **Staff Management** - Auto-update status based on assignments
- **Real-Time Slot Tracking** - Available vs assigned positions

### ✅ **Attendance Management**
- **Daily Attendance Tracking** - Mark attendance with multiple status options
- **Time Tracking** - Check-in and check-out time management
- **Status Management** - Present, Absent, Late, Sick Leave, Emergency Leave, Half Day
- **Attendance Reports** - Date range queries and statistics
- **Staff Attendance Stats** - Individual performance tracking
- **Daily Summary** - Department-wise attendance overview
- **Integration with Leave System** - Automatic attendance marking for approved leaves

### ✅ **Leave Management System**
- **Multiple Leave Types** - Sick, Vacation, Emergency, Maternity, Paternity, Personal, Compensatory, Bereavement
- **Leave Application Workflow** - Apply, Review, Approve/Reject process
- **Emergency Leave Support** - Special handling for urgent requests
- **Leave Calendar** - Team-wide leave visibility
- **Leave Statistics** - Track leave balances and usage patterns
- **Replacement Staff Management** - Assign coverage during leaves
- **Leave Conflict Prevention** - Ensure adequate staffing levels

### ✅ **Intelligent Conflict Detection**
- **Time Overlap Detection** - Prevents staff double-booking
- **Automatic Validation** - Smart assignment checking
- **Detailed Conflict Reports** - See exactly what conflicts exist
- **Bulk Assignment Support** - Assign multiple staff with conflict checking

### ✅ **Comprehensive Filtering & Search**
- **Date Range Queries** - Weekly/monthly schedule views
- **Department Filtering** - Department-specific management
- **Status-Based Search** - Find open/full/closed shifts and attendance records
- **Staff Schedule Tracking** - Individual staff schedules with attendance

### ✅ **Developer Experience**
- **Master Seeder** - One-command database setup
- **Comprehensive API Docs** - Detailed endpoint documentation
- **Development Tools** - Nodemon for auto-restart
- **Error Handling** - Consistent error responses
- **Input Validation** - Express-validator with custom validation rules

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## 🛠️ Quick Setup

### 1. Clone & Install
```bash
git clone <repository-url>
cd HCL_event
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/hcl_healthcare
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_complex_and_long
JWT_EXPIRE=30d

# Server Configuration
PORT=3000
```

### 3. Database Setup (One Command!)
```bash
# 🎉 Seeds everything: admin user + sample shifts
npm run seed
```

### 4. Start Development Server
```bash
npm run dev
```

**🎯 You're ready!** Server running on http://localhost:3000

## 🔐 Default Admin Credentials

```
Email: admin@hcl-squad11.com
Password: Admin123
Role: admin
```

**⚠️ Important:** Change the default password after first login!

## 📚 API Documentation

### Quick API Test
```bash
# 1. Login to get token
POST http://localhost:3000/api/auth/login
{
  "email": "admin@hcl-squad11.com",
  "password": "Admin123"
}

# 2. Use token for protected routes
Authorization: Bearer <your_jwt_token>

# 3. Get all shifts
GET http://localhost:3000/api/shifts
```

### 📖 **[Complete API Documentation](docs/API_DOCUMENTATION.md)**

## 🔄 Available Scripts

### **Production & Development**
| Script | Description |
|--------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with auto-reload |
| `npm run dev:debug` | Start server with Node.js inspector |

### **Database Seeding**
| Script | Description |
|--------|-------------|
| `npm run seed` | **🌟 Master seeder - Seeds everything!** |
| `npm run seed:dev` | Master seeder with auto-reload |
| `npm run seed:admin` | Create admin user only |
| `npm run seed:shifts` | Create sample shifts only |

## 🗂️ API Modules

### 🔐 Authentication (`/api/auth`)
- `POST /login` - User login
- `GET /me` - Get current user profile
- `PUT /updatepassword` - Update password

### 👥 User Management (`/api/users`) *[Admin Only]*
- `GET /` - Get all users (with filtering)
- `POST /` - Create new user
- `PUT /:id` - Update user
- `DELETE /:id` - Delete user
- `GET /role/:role` - Get users by role

### 📅 Shift Management (`/api/shifts`) *[Admin Only]*
- `GET /` - Get all shifts (with advanced filtering)
- `POST /` - Create new shift
- `PUT /:id` - Update shift
- `DELETE /:id` - Delete shift
- `POST /:id/assign` - Assign staff to shift
- `PUT /:id/remove-staff` - Remove staff from shift
- `GET /date-range` - Get shifts by date range
- `GET /staff/:staffId` - Get staff's shifts
- `GET /conflicts` - Check for shift conflicts

### 📊 Attendance Management (`/api/attendance`)
- `POST /mark` - Mark attendance *[Admin Only]*
- `PUT /:id` - Update attendance record *[Admin Only]*
- `GET /` - Get attendance records (with filtering)
- `GET /date-range` - Get attendance by date range
- `GET /stats/:staffId` - Get staff attendance statistics
- `GET /daily-summary/:date` - Get daily attendance summary *[Admin Only]*

### 🏖️ Leave Management (`/api/leaves`)
- `POST /apply` - Apply for leave
- `PUT /review/:id` - Review leave application *[Admin Only]*
- `GET /` - Get leave applications (with filtering)
- `GET /:id` - Get leave by ID
- `PUT /cancel/:id` - Cancel leave application
- `GET /stats/:staffId` - Get leave statistics for staff
- `GET /calendar/team` - Get team leave calendar
- `GET /admin/pending` - Get pending leave applications *[Admin Only]*

## 📊 Shift Management Features

### **Create Shifts with Custom Times**
```json
POST /api/shifts
{
  "shiftType": "Morning",
  "startTime": "09:00",
  "endTime": "17:00",
  "requiredStaff": 5,
  "department": "Emergency",
  "description": "Emergency morning shift"
}
```

### **Smart Staff Assignment**
```json
POST /api/shifts/:id/assign
{
  "staffIds": [
    "65f123456789abcdef123457",
    "65f123456789abcdef123458"
  ]
}
```

**✅ Automatic Features:**
- Conflict detection across time ranges
- Staff slots validation
- Duplicate prevention
- Detailed error reporting

### **Advanced Filtering**
```bash
# Get Emergency morning shifts
GET /api/shifts?department=Emergency&shiftType=Morning

# Get a specific staff member's schedule
GET /api/shifts/staff/65f123...

# Check for conflicts before assignment
GET /api/shifts/conflicts?staffId=65f123...&startTime=09:00&endTime=17:00
```

## 📊 Attendance Management Features

### **Mark Daily Attendance**
```json
POST /api/attendance/mark
{
  "staffId": "65f123456789abcdef123457",
  "shiftId": "65f123456789abcdef123458",
  "date": "2024-01-20",
  "status": "Present",
  "checkInTime": "09:00",
  "checkOutTime": "17:00",
  "remarks": "On time arrival"
}
```

### **Attendance Status Options**
- **Present** - Staff member worked the full shift
- **Absent** - Staff member did not attend
- **Late** - Staff member arrived late
- **Sick Leave** - Medical leave
- **Emergency Leave** - Urgent personal matters
- **Half Day** - Partial attendance

### **Attendance Statistics**
```bash
# Get staff attendance stats for a period
GET /api/attendance/stats/65f123...?startDate=2024-01-01&endDate=2024-01-31

# Get daily attendance summary
GET /api/attendance/daily-summary/2024-01-20
```

## 🏖️ Leave Management Features

### **Apply for Leave**
```json
POST /api/leaves/apply
{
  "leaveType": "Sick Leave",
  "startDate": "2024-01-25",
  "endDate": "2024-01-27",
  "reason": "Medical treatment required for health condition",
  "isEmergency": false,
  "handoverNotes": "Pending cases assigned to Dr. Smith",
  "emergencyContact": {
    "name": "John Doe",
    "phone": "+1234567890",
    "relationship": "Spouse"
  }
}
```

### **Leave Types Supported**
- **Sick Leave** - Medical-related absences
- **Vacation Leave** - Planned time off
- **Emergency Leave** - Urgent personal matters
- **Maternity Leave** - Maternity-related leave
- **Paternity Leave** - Paternity-related leave
- **Personal Leave** - Personal reasons
- **Compensatory Leave** - Compensation for overtime
- **Bereavement Leave** - Family loss

### **Leave Review Process**
```json
PUT /api/leaves/review/:id
{
  "status": "Approved",
  "reviewComments": "Approved with replacement staff assigned",
  "replacementStaff": [
    {
      "shiftId": "65f123456789abcdef123458",
      "staffId": "65f123456789abcdef123459"
    }
  ]
}
```

### **Team Leave Calendar**
```bash
# Get team leave calendar for planning
GET /api/leaves/calendar/team?startDate=2024-01-01&endDate=2024-01-31&department=Emergency
```

## 🏥 Supported Departments

- **General** - General medical care
- **Emergency** - Emergency department
- **ICU** - Intensive Care Unit
- **Surgery** - Surgical department
- **Pediatrics** - Children's care
- **Maternity** - Maternity ward

## 👩‍⚕️ Staff Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| `admin` | System Administrator | Full access to all endpoints |
| `doctor` | Medical Doctor | Limited access (future implementation) |
| `nurse` | Nursing Staff | Limited access (future implementation) |
| `receptionist` | Front Desk Staff | Limited access (future implementation) |
| `pharmacist` | Pharmacy Staff | Limited access (future implementation) |
| `technician` | Technical Staff | Limited access (future implementation) |

## 📊 Database Schema

### User Model
```javascript
{
  name: String,           // Full name
  phone: String,          // Contact number
  email: String,          // Unique email address
  active: Number,         // 1 = active, 0 = inactive
  password: String,       // Hashed password (excluded from responses)
  role: String,           // User role (enum)
  createdBy: Date,        // Creation timestamp
  updatedBy: Date,        // Last update timestamp
  timestamps: true        // Automatic createdAt/updatedAt
}
```

### Shift Model
```javascript
{
  shiftType: String,             // "Morning", "Afternoon", "Night"
  startTime: String,             // "HH:MM" (24-hour format)
  endTime: String,               // "HH:MM" (24-hour format)
  requiredStaff: Number,         // Maximum staff slots
  assignedStaff: [ObjectId],     // References to User model
  department: String,            // Department enum
  status: String,                // "Open", "Full", "Closed"
  description: String,           // Optional description
  createdBy: ObjectId,           // Admin who created
  updatedBy: ObjectId,           // Admin who last updated
  timestamps: true               // Auto createdAt/updatedAt
}
```

### Attendance Model
```javascript
{
  staffId: ObjectId,             // Reference to User model
  shiftId: ObjectId,             // Reference to Shift model
  date: Date,                    // Attendance date
  status: String,                // Present, Absent, Late, etc.
  checkInTime: String,           // "HH:MM" format
  checkOutTime: String,          // "HH:MM" format
  totalHours: Number,            // Calculated working hours
  isLate: Boolean,               // Auto-calculated late status
  remarks: String,               // Additional notes
  leaveId: ObjectId,             // Reference to Leave (if applicable)
  markedBy: ObjectId,            // Admin who marked attendance
  timestamps: true               // Auto createdAt/updatedAt
}
```

### Leave Model
```javascript
{
  staffId: ObjectId,             // Reference to User model
  leaveType: String,             // Leave type enum
  startDate: Date,               // Leave start date
  endDate: Date,                 // Leave end date
  totalDays: Number,             // Calculated leave duration
  reason: String,                // Leave reason
  status: String,                // Pending, Approved, Rejected, Cancelled
  isEmergency: Boolean,          // Emergency leave flag
  appliedDate: Date,             // Application date
  reviewedDate: Date,            // Review date
  reviewedBy: ObjectId,          // Admin who reviewed
  reviewComments: String,        // Review notes
  handoverNotes: String,         // Work handover details
  emergencyContact: {            // Emergency contact info
    name: String,
    phone: String,
    relationship: String
  },
  replacementStaff: [{           // Assigned replacements
    shiftId: ObjectId,
    staffId: ObjectId
  }],
  timestamps: true               // Auto createdAt/updatedAt
}
```

## 🛡️ Security Features

- **Password Hashing** - Bcrypt with salt rounds
- **JWT Tokens** - Configurable expiration (default: 30 days)
- **Role Authorization** - Middleware for role-based access
- **Active User Check** - Only active users can login
- **Input Validation** - Express-validator for request validation
- **Audit Trail** - Track who created/modified records

## 🔧 Development Configuration

### Nodemon Setup
Enhanced development experience with automatic restart:
- **Watches:** `server.js`, `controllers/`, `routes/`, `middleware/`, `models/`, `config/`, `seeders/`
- **Ignores:** `node_modules/`, test files, logs, git files
- **Extensions:** `.js`, `.json`, `.env`
- **Delay:** 1000ms
- **Restartable:** Type `rs` to manually restart

## 🚨 Important Security Notes

⚠️ **Production Checklist:**
- [ ] Change default admin password immediately
- [ ] Use strong, unique JWT_SECRET (minimum 32 characters)
- [ ] Set NODE_ENV=production
- [ ] Use HTTPS in production
- [ ] Enable MongoDB authentication
- [ ] Implement rate limiting
- [ ] Add request logging

## 🐛 Troubleshooting

### Common Issues

**Database connection error:**
```bash
# Check MongoDB is running
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS

# Verify MONGO_URI in .env file
```

**Seeding issues:**
```bash
# Run seeders individually
npm run seed:admin
npm run seed:shifts

# Clear and re-seed
# (Note: This will delete all existing data)
npm run seed
```

**JWT token errors:**
```bash
# Ensure JWT_SECRET is set in .env
# Use a long, complex secret key (>32 characters)
```

**Port already in use:**
```bash
# Change PORT in .env file or kill existing process
lsof -ti:3000 | xargs kill -9  # Kill process on port 3000
```

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ },
  "pagination": { /* pagination info */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message",
  "errors": [ /* validation errors */ ]
}
```

## 🔄 Project Structure
```
HCL_event/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── userController.js    # User management
│   ├── shiftController.js   # Shift management
│   ├── attendanceController.js # Attendance tracking
│   └── leaveController.js   # Leave management
├── middleware/
│   ├── auth.js             # JWT & role middleware
│   └── validation.js       # Request validation
├── models/
│   ├── User.js             # User schema
│   ├── Shift.js            # Shift schema
│   ├── Attendance.js       # Attendance schema
│   └── Leave.js            # Leave schema
├── routes/
│   ├── authRoutes.js       # Auth endpoints
│   ├── userRoutes.js       # User endpoints
│   ├── shiftRoutes.js      # Shift endpoints
│   ├── attendanceRoutes.js # Attendance endpoints
│   └── leaveRoutes.js      # Leave endpoints
├── seeders/
│   ├── masterSeeder.js     # Master seeder
│   ├── adminSeeder.js      # Admin user seeder
│   └── shiftSeeder.js      # Shift data seeder
├── docs/
│   ├── API_DOCUMENTATION.md # Complete API docs
│   └── SHIFT_API.md        # Shift-specific docs
├── server.js               # Main server file
├── package.json            # Dependencies & scripts
└── README.md               # This file
```

## 📈 Future Roadmap

### Phase 2 Features:
1. ✅ **Attendance Management** - Mark and track attendance (COMPLETED)
2. ✅ **Leave Management System** - Complete leave workflow (COMPLETED)
3. **Daily Schedule Views** - Calendar interfaces
4. **Notification System** - Real-time alerts for conflicts
5. **Reporting Dashboard** - Analytics and insights
6. **Mobile API** - React Native/Flutter support
7. **Advanced Scheduling** - Recurring shifts, templates
8. **Staff Preferences** - Preferred shift times and departments

### Phase 3 Features:
1. **Real-time Updates** - WebSocket support
2. **Advanced Reporting** - PDF generation, charts
3. **Integration APIs** - Third-party calendar systems
4. **Multi-tenant Support** - Multiple hospitals
5. **Advanced Analytics** - ML-powered insights
6. **Document Management** - Medical certificates, leave documents
7. **Automated Leave Balance** - Annual leave tracking and accrual

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🏆 Current Progress

**Overall Completion: ~75%**

✅ **Completed:**
- Authentication system (100%)
- User management (100%)
- Shift management (100%)
- Conflict detection (100%)
- **Attendance management (100%)**
- **Leave management (100%)**
- Database seeding (100%)
- API documentation (100%)

🚧 **In Progress:**
- Daily schedule views (0%)
- Frontend interface (0%)
- Notification system (0%)

✅ **Recently Added:**
- **Comprehensive attendance tracking system**
- **Full-featured leave management workflow**
- **Advanced filtering and reporting capabilities**
- **Integration between attendance and leave systems**

## 📞 Support & Contact

For technical support or questions:
1. Check the [API Documentation](docs/API_DOCUMENTATION.md)
2. Review error messages and logs
3. Verify environment configuration
4. Test with provided sample data

**Happy Coding! 🎉**
