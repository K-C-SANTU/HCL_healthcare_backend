# HCL Healthcare Management System

A comprehensive backend API for healthcare staff management with JWT authentication, role-based access control, and user management features.

## 🚀 Features

- **JWT Authentication** - Secure login with token-based authentication
- **Role-Based Access Control** - Admin, Doctor, Nurse, Receptionist, Pharmacist, Technician roles
- **User Management** - CRUD operations for managing healthcare staff
- **Password Security** - Bcrypt hashing with salt rounds
- **Admin Seeder** - Automated admin user creation
- **Input Validation** - Comprehensive request validation
- **MongoDB Integration** - Document-based data storage
- **Development Tools** - Nodemon for auto-restart during development

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd HCL_event
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
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

### 4. Create Admin User
Run the seeder to create the default admin user:
```bash
npm run seed:admin
```

**Default Admin Credentials:**
- **Email:** admin@hcl-squad11.com
- **Password:** Admin123
- **Role:** admin

### 5. Start the Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start

# Debug mode
npm run dev:debug
```

## 🔐 Authentication

### Login
**POST** `/api/auth/login`
```json
{
  "email": "admin@hcl-squad11.com",
  "password": "Admin123"
}
```

### Get Profile
**GET** `/api/auth/me`
```
Headers: Authorization: Bearer <token>
```

### Update Password
**PUT** `/api/auth/updatepassword`
```json
{
  "currentPassword": "Admin123",
  "newPassword": "NewSecurePassword123"
}
```

## 👥 User Management (Admin Only)

All user management endpoints require admin authentication.

### Get All Users
**GET** `/api/users?page=1&limit=10&role=doctor&active=1`

### Get User by ID
**GET** `/api/users/:id`

### Get Users by Role
**GET** `/api/users/role/:role`

### Create User
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

### Update User
**PUT** `/api/users/:id`

### Delete User
**DELETE** `/api/users/:id`

## 🎭 User Roles

| Role | Description | Access Level |
|------|-------------|--------------|
| `admin` | System Administrator | Full access to all endpoints |
| `doctor` | Medical Doctor | Limited access (to be defined) |
| `nurse` | Nursing Staff | Limited access (to be defined) |
| `receptionist` | Front Desk Staff | Limited access (to be defined) |
| `pharmacist` | Pharmacy Staff | Limited access (to be defined) |
| `technician` | Technical Staff | Limited access (to be defined) |

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

## 🛡️ Security Features

- **Password Hashing** - Bcrypt with salt rounds
- **JWT Tokens** - Configurable expiration (default: 30 days)
- **Role Authorization** - Middleware for role-based access
- **Active User Check** - Only active users can login
- **Input Validation** - Express-validator for request validation
- **Password Requirements** - Minimum 6 characters with complexity rules

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with nodemon |
| `npm run dev:debug` | Start server with Node.js inspector |
| `npm run dev:watch` | Enhanced file watching |
| `npm run seed:admin` | Create admin user |
| `npm run seed:admin:dev` | Create admin user with nodemon |

## 🔧 Development Configuration

### Nodemon Setup
The project includes nodemon configuration for optimal development experience:
- Watches: `server.js`, `controllers/`, `routes/`, `middleware/`, `models/`, `config/`, `seeders/`
- Ignores: `node_modules/`, test files, logs, git files
- Extensions: `.js`, `.json`, `.env`
- Delay: 1000ms
- Restartable: Type `rs` to manually restart

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

**Admin user already exists:**
```bash
# Delete existing admin user or use current credentials
# The seeder prevents duplicate admin creation
```

**Database connection error:**
```bash
# Check MongoDB is running
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS

# Verify MONGO_URI in .env file
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
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ /* validation errors */ ]
}
```

## 🔄 Project Structure

```
HCL_event/
├── controllers/          # Business logic
│   ├── authController.js
│   └── userController.js
├── middleware/           # Custom middleware
│   ├── auth.js
│   └── validation.js
├── models/              # Database models
│   └── User.js
├── routes/              # API routes
│   ├── authRoutes.js
│   └── userRoutes.js
├── config/              # Configuration files
│   └── database.js
├── seeders/             # Database seeders
│   └── adminSeeder.js
├── server.js            # Application entry point
├── package.json         # Project dependencies
├── nodemon.json         # Nodemon configuration
└── README.md           # Project documentation
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Authors

- **Development Team** - HCL Squad 11

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Review the troubleshooting section above

---

**Happy Coding! 🚀**
