# HCL Healthcare Management System

A comprehensive backend API for healthcare staff management with JWT authentication, role-based access control, and advanced shift scheduling with automatic conflict detection.

## 🚀 Features

### ✅ **Authentication & Security**
- **JWT Authentication** - Secure login with token-based authentication
- **Role-Based Access Control** - Admin, Doctor, Nurse, Receptionist, Pharmacist, Technician roles
- **Password Security** - Bcrypt hashing with salt rounds
- **Input Validation** - Comprehensive request validation
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
- **Capacity Management** - Auto-update status based on assignments
- **Real-Time Slot Tracking** - Available vs assigned positions

### ✅ **Intelligent Conflict Detection**
- **Time Overlap Detection** - Prevents staff double-booking
- **Automatic Validation** - Smart assignment checking
- **Detailed Conflict Reports** - See exactly what conflicts exist
- **Bulk Assignment Support** - Assign multiple staff with conflict checking

### ✅ **Comprehensive Filtering & Search**
- **Date Range Queries** - Weekly/monthly schedule views
- **Department Filtering** - Department-specific management
- **Status-Based Search** - Find open/full/closed shifts
- **Staff Schedule Tracking** - Individual staff schedules

### ✅ **Developer Experience**
- **Master Seeder** - One-command database setup
- **Comprehensive API Docs** - Detailed endpoint documentation
- **Development Tools** - Nodemon for auto-restart
- **Error Handling** - Consistent error responses

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

## 📊 Shift Management Features

### **Create Shifts with Custom Times**
```json
POST /api/shifts
{
  "date": "2024-01-20",
  "shiftType": "Morning",
  "startTime": "09:00",
  "endTime": "17:00",
  "capacity": 5,
  "department": "Emergency",
  "description": "Weekend emergency shift"
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
- Capacity validation
- Duplicate prevention
- Detailed error reporting

### **Advanced Filtering**
```bash
# Get Emergency morning shifts for next week
GET /api/shifts?department=Emergency&shiftType=Morning&startDate=2024-01-15&endDate=2024-01-21

# Get a specific staff member's schedule
GET /api/shifts/staff/65f123...?startDate=2024-01-15&endDate=2024-01-21

# Check for conflicts before assignment
GET /api/shifts/conflicts?staffId=65f123...&date=2024-01-20&startTime=09:00&endTime=17:00
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
  date: Date,                    // Shift date
  shiftType: String,             // "Morning", "Afternoon", "Night"
  startTime: String,             // "HH:MM" (24-hour format)
  endTime: String,               // "HH:MM" (24-hour format)
  capacity: Number,              // Maximum staff capacity
  assignedStaff: [ObjectId],     // References to User model
  department: String,            // Department enum
  status: String,                // "Open", "Full", "Closed"
  description: String,           // Optional description
  createdBy: ObjectId,           // Admin who created
  updatedBy: ObjectId,           // Admin who last updated
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
│   └── shiftController.js   # Shift management
├── middleware/
│   ├── auth.js             # JWT & role middleware
│   └── validation.js       # Request validation
├── models/
│   ├── User.js             # User schema
│   └── Shift.js            # Shift schema
├── routes/
│   ├── authRoutes.js       # Auth endpoints
│   ├── userRoutes.js       # User endpoints
│   └── shiftRoutes.js      # Shift endpoints
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
1. **Attendance Management** - Mark and track attendance
2. **Daily Schedule Views** - Calendar interfaces
3. **Notification System** - Real-time alerts for conflicts
4. **Reporting Dashboard** - Analytics and insights
5. **Mobile API** - React Native/Flutter support
6. **Advanced Scheduling** - Recurring shifts, templates
7. **Staff Preferences** - Preferred shift times and departments

### Phase 3 Features:
1. **Real-time Updates** - WebSocket support
2. **Advanced Reporting** - PDF generation, charts
3. **Integration APIs** - Third-party calendar systems
4. **Multi-tenant Support** - Multiple hospitals
5. **Advanced Analytics** - ML-powered insights

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🏆 Current Progress

**Overall Completion: ~45%**

✅ **Completed:**
- Authentication system (100%)
- User management (100%)
- Shift management (100%)
- Conflict detection (100%)
- Database seeding (100%)
- API documentation (100%)

🚧 **In Progress:**
- Attendance management (0%)
- Daily schedule views (0%)
- Frontend interface (0%)

## 📞 Support & Contact

For technical support or questions:
1. Check the [API Documentation](docs/API_DOCUMENTATION.md)
2. Review error messages and logs
3. Verify environment configuration
4. Test with provided sample data

**Happy Coding! 🎉**
