# Shift Management API Documentation

## Overview
The Shift Management module provides comprehensive functionality for creating, managing, and assigning healthcare staff to shifts with conflict detection and time validation.

## Authentication
All shift endpoints require admin authentication:
```
Authorization: Bearer <admin_jwt_token>
```

## Base URL
```
/api/shifts
```

---

## Endpoints

### 1. Get All Shifts
**GET** `/api/shifts`

Query parameters for filtering and pagination:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `date` (string): Specific date (YYYY-MM-DD)
- `startDate` (string): Start date for range (YYYY-MM-DD)
- `endDate` (string): End date for range (YYYY-MM-DD)
- `shiftType` (string): Morning, Afternoon, Night
- `department` (string): General, Emergency, ICU, Surgery, Pediatrics, Maternity
- `status` (string): Open, Full, Closed

**Example Request:**
```bash
GET /api/shifts?page=1&limit=10&department=Emergency&shiftType=Morning
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f123456789abcdef123456",
      "date": "2024-01-15T00:00:00.000Z",
      "shiftType": "Morning",
      "startTime": "07:00",
      "endTime": "15:00",
      "capacity": 6,
      "assignedStaff": [
        {
          "_id": "65f123456789abcdef123457",
          "name": "Dr. John Doe",
          "email": "john.doe@hcl-squad11.com",
          "role": "doctor",
          "phone": "+1234567891"
        }
      ],
      "department": "Emergency",
      "status": "Open",
      "description": "Emergency morning shift",
      "createdBy": {
        "_id": "65f123456789abcdef123458",
        "name": "Admin User",
        "email": "admin@hcl-squad11.com"
      },
      "createdAt": "2024-01-10T10:00:00.000Z",
      "updatedAt": "2024-01-10T10:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 45,
    "itemsPerPage": 10
  }
}
```

---

### 2. Get Shift by ID
**GET** `/api/shifts/:id`

**Example Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65f123456789abcdef123456",
    "date": "2024-01-15T00:00:00.000Z",
    "shiftType": "Morning",
    "startTime": "07:00",
    "endTime": "15:00",
    "capacity": 6,
    "assignedStaff": [...],
    "department": "Emergency",
    "status": "Open",
    "description": "Emergency morning shift"
  }
}
```

---

### 3. Create New Shift
**POST** `/api/shifts`

**Request Body:**
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

**Validation Rules:**
- `date`: Required, ISO format (YYYY-MM-DD)
- `shiftType`: Required, must be "Morning", "Afternoon", or "Night"
- `startTime`: Required, HH:MM format (24-hour)
- `endTime`: Required, HH:MM format (24-hour)
- `capacity`: Required, integer between 1-50
- `department`: Required, valid department enum
- `description`: Optional, max 500 characters

**Example Response:**
```json
{
  "success": true,
  "message": "Shift created successfully",
  "data": {
    "_id": "65f123456789abcdef123456",
    "date": "2024-01-15T00:00:00.000Z",
    "shiftType": "Morning",
    "startTime": "07:00",
    "endTime": "15:00",
    "capacity": 6,
    "assignedStaff": [],
    "department": "Emergency",
    "status": "Open",
    "description": "Emergency morning shift",
    "createdBy": {...}
  }
}
```

---

### 4. Update Shift
**PUT** `/api/shifts/:id`

**Request Body:** (all fields optional)
```json
{
  "startTime": "08:00",
  "endTime": "16:00",
  "capacity": 8,
  "status": "Open",
  "description": "Updated description"
}
```

---

### 5. Delete Shift
**DELETE** `/api/shifts/:id`

**Example Response:**
```json
{
  "success": true,
  "message": "Shift deleted successfully"
}
```

---

### 6. Assign Staff to Shift
**POST** `/api/shifts/:id/assign`

**Request Body:**
```json
{
  "staffIds": [
    "65f123456789abcdef123457",
    "65f123456789abcdef123458"
  ]
}
```

**Features:**
- Automatically checks for conflicts
- Validates available capacity
- Prevents duplicate assignments
- Returns detailed conflict information if any

**Success Response:**
```json
{
  "success": true,
  "message": "2 staff assigned successfully",
  "data": {
    "_id": "65f123456789abcdef123456",
    "assignedStaff": [...],
    "status": "Open"
  }
}
```

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

---

### 7. Remove Staff from Shift
**PUT** `/api/shifts/:id/remove-staff`

**Request Body:**
```json
{
  "staffIds": [
    "65f123456789abcdef123457"
  ]
}
```

---

### 8. Get Shifts by Date Range
**GET** `/api/shifts/date-range?startDate=2024-01-15&endDate=2024-01-21`

**Example Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 45
}
```

---

### 9. Get Staff Shifts
**GET** `/api/shifts/staff/:staffId?startDate=2024-01-15&endDate=2024-01-21`

Returns all shifts assigned to a specific staff member.

---

### 10. Check Shift Conflicts
**GET** `/api/shifts/conflicts?staffId=65f123456789abcdef123457&date=2024-01-15&startTime=07:00&endTime=15:00`

**Example Response:**
```json
{
  "success": true,
  "data": {
    "hasConflicts": true,
    "conflicts": [
      {
        "_id": "65f123456789abcdef123459",
        "shiftType": "Morning",
        "startTime": "06:00",
        "endTime": "14:00",
        "department": "General",
        "assignedStaff": [...]
      }
    ]
  }
}
```

---

## Data Models

### Shift Schema
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
  createdAt: Date,               // Auto-generated
  updatedAt: Date                // Auto-generated
}
```

### Virtual Fields
- `availableSlots`: Calculated as capacity - assignedStaff.length
- `isFull`: Boolean indicating if shift is at capacity

---

## Error Responses

### Validation Error (400)
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

### Not Found (404)
```json
{
  "success": false,
  "message": "Shift not found"
}
```

### Conflict (409)
```json
{
  "success": false,
  "message": "Shift conflicts detected",
  "conflicts": [...]
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Error creating shift",
  "error": "Detailed error message"
}
```

---

## Testing with Sample Data

### 1. First, create admin user:
```bash
npm run seed:admin
```

### 2. Create sample shifts:
```bash
npm run seed:shifts
```

### 3. Start the server:
```bash
npm run dev
```

### 4. Login to get admin token:
```bash
POST /api/auth/login
{
  "email": "admin@hcl-squad11.com",
  "password": "Admin123"
}
```

### 5. Test shift endpoints with the token:
```bash
# Get all shifts
GET /api/shifts
Authorization: Bearer <your_token>

# Create a new shift
POST /api/shifts
Authorization: Bearer <your_token>
{
  "date": "2024-01-20",
  "shiftType": "Morning",
  "startTime": "09:00",
  "endTime": "17:00",
  "capacity": 5,
  "department": "General",
  "description": "Weekend morning shift"
}
```

---

## Business Logic Features

### ✅ **Conflict Detection**
- Automatically detects time overlaps for staff assignments
- Prevents double-booking of staff members
- Returns detailed conflict information

### ✅ **Capacity Management**
- Auto-updates shift status based on capacity
- Prevents over-assignment of staff
- Real-time available slots calculation

### ✅ **Time Validation**
- Validates time format (HH:MM)
- Supports 24-hour time format
- Handles overnight shifts (22:00 to 06:00)

### ✅ **Department Filtering**
- Supports multiple hospital departments
- Easy filtering and organization
- Department-specific shift management

### ✅ **Audit Trail**
- Tracks who created/updated shifts
- Timestamps for all operations
- Complete history tracking 