# HCL Healthcare Management System - Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
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

### 3. Create Admin User

Run the seeder to create the default admin user:

```bash
npm run seed:admin
```

**Output:**

```
✅ Admin user created successfully
📧 Email: admin@hcl-squad11.com
🔒 Password: Admin123
👤 Role: admin
⚠️  Please change the default password after first login!
```

### 4. Start the Server

```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

### 5. Test Login

Use any API client (Postman, curl, etc.) to test login:

**POST** `http://localhost:3000/api/auth/login`

```json
{
  "email": "admin@hcl-squad11.com",
  "password": "Admin123"
}
```

### 6. Change Default Password

After successful login, immediately change the password:

**PUT** `http://localhost:3000/api/auth/updatepassword`

```json
{
  "currentPassword": "Admin123",
  "newPassword": "YourNewSecurePassword123"
}
```

## Important Security Notes

⚠️ **Always change the default admin password after setup!**

⚠️ **Use a strong JWT_SECRET in production**

⚠️ **Set NODE_ENV=production in production environment**

## Available Scripts

- `npm start` - Start the server
- `npm run dev` - Start with nodemon for development
- `npm run seed:admin` - Create admin user

## Next Steps

1. Login with admin credentials
2. Change the default password
3. Start creating other users through the admin panel
4. Refer to `AUTH_API_DOCS.md` for complete API documentation

## Troubleshooting

**Admin user already exists error:**

- The seeder will not create duplicate admin users
- Use the existing admin credentials or delete the user from database first

**Database connection error:**

- Ensure MongoDB is running
- Check your MONGO_URI in .env file

**JWT errors:**

- Ensure JWT_SECRET is set in .env file
- Use a long, complex secret key
