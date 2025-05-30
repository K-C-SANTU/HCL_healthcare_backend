# HCL Healthcare Backend

A RESTful API backend application for hospital staff management built with Node.js, Express.js, and MongoDB.

## Features

- Complete CRUD operations for hospital staff management
- RESTful API endpoints
- MongoDB integration with Mongoose ODM
- Input validation and error handling
- Pagination and filtering support
- Department-wise staff filtering
- Professional data modeling for healthcare environment

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **express-validator** - Input validation
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## Project Structure

```
├── config/
│   └── database.js          # MongoDB connection configuration
├── controllers/
│   └── staffController.js   # Staff CRUD operations
├── middleware/
│   └── validation.js        # Input validation middleware
├── models/
│   └── Staff.js            # Staff data model
├── routes/
│   └── staffRoutes.js      # API route definitions
├── .gitignore
├── package.json
├── server.js               # Main application entry point
└── README.md
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd HCL_event
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
# Create .env file with the following variables:
PORT=3000
MONGODB_URI=mongodb://localhost:27017/hcl_healthcare
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

4. Make sure MongoDB is running on your system

5. Start the application:
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## API Endpoints

### Base URL: `http://localhost:3000`

### Staff Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API documentation and welcome message |
| GET | `/health` | Health check endpoint |
| GET | `/api/staff` | Get all staff members (with pagination) |
| GET | `/api/staff/:id` | Get staff member by ID |
| GET | `/api/staff/department/:department` | Get staff by department |
| POST | `/api/staff` | Create new staff member |
| PUT | `/api/staff/:id` | Update staff member |
| DELETE | `/api/staff/:id` | Delete staff member |

### Query Parameters for GET /api/staff

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `department` - Filter by department
- `position` - Filter by position
- `isActive` - Filter by active status (true/false)

## Staff Data Model

```json
{
  "employeeId": "EMP001",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@hospital.com",
  "phone": "+1234567890",
  "department": "Emergency",
  "position": "Doctor",
  "dateOfJoining": "2024-01-15",
  "salary": 75000,
  "isActive": true,
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

### Available Departments
- Emergency
- Cardiology
- Neurology
- Pediatrics
- Surgery
- Radiology
- Laboratory
- Pharmacy
- Administration
- Nursing

### Available Positions
- Doctor
- Nurse
- Technician
- Administrator
- Pharmacist
- Radiologist
- Lab Technician
- Surgeon
- Specialist

## Example API Usage

### Create a new staff member
```bash
curl -X POST http://localhost:3000/api/staff \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "EMP001",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@hospital.com",
    "phone": "+1234567890",
    "department": "Emergency",
    "position": "Doctor",
    "dateOfJoining": "2024-01-15",
    "salary": 75000
  }'
```

### Get all staff members
```bash
curl http://localhost:3000/api/staff
```

### Get staff by department
```bash
curl http://localhost:3000/api/staff/department/Emergency
```

### Update staff member
```bash
curl -X PUT http://localhost:3000/api/staff/STAFF_ID \
  -H "Content-Type: application/json" \
  -d '{
    "salary": 80000,
    "position": "Senior Doctor"
  }'
```

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

## Error Handling

The API includes comprehensive error handling:

- **400 Bad Request** - Validation errors
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server errors

## Development

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Running in Development Mode
```bash
npm run dev
```

This will start the server with nodemon for automatic restarts on file changes.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.
