# Attendance & Leave Management API Documentation

## Overview

This documentation covers the Attendance and Leave Management APIs for the Healthcare Management System. These APIs handle staff attendance tracking, leave applications, approvals, and reporting.

## Base URL
```
http://localhost:3000/api
```

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 🕐 Attendance Management

### Mark Attendance
Create a new attendance record for a staff member.

**Endpoint:** `POST /attendance/mark`  
**Access:** Admin only  
**Content-Type:** `application/json`

#### Request Body
```json
{
  "staffId": "64a1b2c3d4e5f6789abc123d",
  "shiftId": "64a1b2c3d4e5f6789abc123e",
  "date": "2024-01-15",
  "status": "Present",
  "checkInTime": "09:00",
  "checkOutTime": "17:00",
  "remarks": "On time arrival",
  "leaveId": "64a1b2c3d4e5f6789abc123f"
}
```

#### Response
```json
{
  "success": true,
  "message": "Attendance marked successfully",
  "data": {
    "_id": "64a1b2c3d4e5f6789abc1234",
    "staffId": {
      "_id": "64a1b2c3d4e5f6789abc123d",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "staff"
    },
    "shiftId": {
      "_id": "64a1b2c3d4e5f6789abc123e",
      "shiftType": "Morning",
      "department": "Emergency"
    },
    "date": "2024-01-15T00:00:00.000Z",
    "status": "Present",
    "checkInTime": "09:00",
    "checkOutTime": "17:00",
    "actualHoursWorked": 8,
    "scheduledHoursWorked": 8,
    "attendancePercentage": 100,
    "isLateEntry": false,
    "lateByMinutes": 0,
    "isEarlyExit": false,
    "earlyByMinutes": 0,
    "remarks": "On time arrival",
    "markedBy": "64a1b2c3d4e5f6789abc123a",
    "markedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### Update Attendance
Update an existing attendance record.

**Endpoint:** `PUT /attendance/:id`  
**Access:** Admin only

#### Request Body
```json
{
  "status": "Late",
  "checkInTime": "09:30",
  "remarks": "Traffic delay"
}
```

### Get Attendance Records
Retrieve attendance records with filtering and pagination.

**Endpoint:** `GET /attendance`  
**Access:** All authenticated users (staff see only their records)

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `staffId` (optional): Filter by staff ID
- `shiftId` (optional): Filter by shift ID
- `date` (optional): Filter by specific date (YYYY-MM-DD)
- `startDate` (optional): Filter by date range start
- `endDate` (optional): Filter by date range end
- `status` (optional): Filter by attendance status
- `department` (optional): Filter by department

#### Example Request
```
GET /attendance?page=1&limit=10&status=Present&department=Emergency&startDate=2024-01-01&endDate=2024-01-31
```

### Get Attendance by Date Range
Retrieve attendance records for a specific date range.

**Endpoint:** `GET /attendance/date-range`  
**Access:** All authenticated users

#### Query Parameters (Required)
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)
- `staffId` (optional): Filter by staff ID
- `department` (optional): Filter by department

### Get Staff Attendance Statistics
Get detailed attendance statistics for a staff member.

**Endpoint:** `GET /attendance/stats/:staffId`  
**Access:** Admin or own stats only

#### Query Parameters
- `year` (optional): Specific year (2020-2030)
- `startDate` (optional): Custom date range start
- `endDate` (optional): Custom date range end

#### Response
```json
{
  "success": true,
  "data": {
    "period": {
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-01-31T23:59:59.999Z"
    },
    "statistics": [
      {
        "_id": "Present",
        "count": 20,
        "totalHours": 160
      },
      {
        "_id": "Late",
        "count": 3,
        "totalHours": 24
      }
    ],
    "summary": {
      "totalDays": 23,
      "totalHours": 184,
      "presentDays": 20,
      "absentDays": 0,
      "lateDays": 3,
      "leavesDays": 0,
      "attendancePercentage": 100,
      "averageHoursPerDay": 8.0
    }
  }
}
```

### Get Daily Attendance Summary
Get attendance summary for a specific date by department.

**Endpoint:** `GET /attendance/daily-summary/:date`  
**Access:** Admin only

#### Example Response
```json
{
  "success": true,
  "data": {
    "date": "2024-01-15T00:00:00.000Z",
    "departments": [
      {
        "_id": "Emergency",
        "statuses": [
          {
            "status": "Present",
            "count": 5,
            "totalHours": 40
          },
          {
            "status": "Late",
            "count": 1,
            "totalHours": 8
          }
        ],
        "totalStaff": 6,
        "totalHours": 48
      }
    ]
  }
}
```

---

## 🏖️ Leave Management

### Apply for Leave
Submit a new leave application.

**Endpoint:** `POST /leaves/apply`  
**Access:** All authenticated users

#### Request Body
```json
{
  "staffId": "64a1b2c3d4e5f6789abc123d",
  "leaveType": "Sick Leave",
  "startDate": "2024-02-01",
  "endDate": "2024-02-03",
  "reason": "Suffering from viral fever and need bed rest for recovery",
  "isEmergency": false,
  "handoverNotes": "All pending tasks assigned to team lead",
  "emergencyContact": {
    "name": "Jane Doe",
    "phone": "+1234567890",
    "relationship": "Spouse"
  }
}
```

#### Response
```json
{
  "success": true,
  "message": "Leave application submitted successfully",
  "data": {
    "_id": "64a1b2c3d4e5f6789abc1235",
    "staffId": {
      "_id": "64a1b2c3d4e5f6789abc123d",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "leaveType": "Sick Leave",
    "startDate": "2024-02-01T00:00:00.000Z",
    "endDate": "2024-02-03T00:00:00.000Z",
    "numberOfDays": 3,
    "duration": "3 days",
    "reason": "Suffering from viral fever and need bed rest for recovery",
    "status": "Pending",
    "appliedDate": "2024-01-20T10:00:00.000Z",
    "isEmergency": false,
    "handoverNotes": "All pending tasks assigned to team lead",
    "emergencyContact": {
      "name": "Jane Doe",
      "phone": "+1234567890",
      "relationship": "Spouse"
    },
    "affectedShifts": ["64a1b2c3d4e5f6789abc123e"]
  }
}
```

### Review Leave Application
Approve or reject a leave application.

**Endpoint:** `PUT /leaves/review/:id`  
**Access:** Admin only

#### Request Body
```json
{
  "status": "Approved",
  "reviewComments": "Approved. Please ensure proper handover.",
  "replacementStaff": [
    {
      "shiftId": "64a1b2c3d4e5f6789abc123e",
      "staffId": "64a1b2c3d4e5f6789abc123f"
    }
  ]
}
```

### Get Leave Applications
Retrieve leave applications with filtering.

**Endpoint:** `GET /leaves`  
**Access:** All authenticated users (staff see only their leaves)

#### Query Parameters
- `page` (optional): Page number
- `limit` (optional): Items per page
- `staffId` (optional): Filter by staff ID (admin only)
- `status` (optional): Filter by leave status
- `leaveType` (optional): Filter by leave type
- `startDate` (optional): Filter by date range
- `endDate` (optional): Filter by date range
- `department` (optional): Filter by department

### Get Leave by ID
Retrieve a specific leave application.

**Endpoint:** `GET /leaves/:id`  
**Access:** Admin or own leave only

### Cancel Leave Application
Cancel a pending or approved leave application.

**Endpoint:** `PUT /leaves/cancel/:id`  
**Access:** Admin or own leave only

### Get Leave Statistics
Get detailed leave statistics for a staff member.

**Endpoint:** `GET /leaves/stats/:staffId`  
**Access:** Admin or own stats only

#### Query Parameters
- `year` (optional): Specific year (default: current year)

#### Response
```json
{
  "success": true,
  "data": {
    "year": 2024,
    "summary": {
      "totalEntitled": 159,
      "totalUsed": 12,
      "totalRemaining": 147
    },
    "leaveTypes": {
      "Sick Leave": {
        "entitled": 12,
        "used": 3,
        "remaining": 9
      },
      "Vacation Leave": {
        "entitled": 21,
        "used": 5,
        "remaining": 16
      }
    },
    "detailedStats": [
      {
        "_id": "Sick Leave",
        "totalDays": 3,
        "count": 1
      }
    ]
  }
}
```

### Get Team Leave Calendar
Get leave calendar for team planning.

**Endpoint:** `GET /leaves/calendar/team`  
**Access:** All authenticated users

#### Query Parameters (Required)
- `startDate`: Start date (YYYY-MM-DD)
- `endDate`: End date (YYYY-MM-DD)
- `department` (optional): Filter by department

### Get Pending Leave Applications
Get all pending leave applications for admin dashboard.

**Endpoint:** `GET /leaves/admin/pending`  
**Access:** Admin only

#### Response
```json
{
  "success": true,
  "data": {
    "urgent": [
      {
        "_id": "64a1b2c3d4e5f6789abc1235",
        "staffId": {
          "name": "John Doe",
          "department": "Emergency"
        },
        "leaveType": "Emergency Leave",
        "startDate": "2024-01-25T00:00:00.000Z",
        "isEmergency": true
      }
    ],
    "regular": [
      {
        "_id": "64a1b2c3d4e5f6789abc1236",
        "staffId": {
          "name": "Jane Smith",
          "department": "ICU"
        },
        "leaveType": "Vacation Leave",
        "startDate": "2024-02-15T00:00:00.000Z"
      }
    ],
    "total": 2
  }
}
```

---

## 📝 Field Definitions

### Attendance Status Options
- `Present`: Staff attended and worked the full shift
- `Absent`: Staff did not show up for work
- `Late`: Staff arrived late but completed the shift
- `Sick Leave`: Staff on approved sick leave
- `Emergency Leave`: Staff on approved emergency leave
- `Half Day`: Staff worked only half the scheduled hours

### Leave Types
- `Sick Leave`: Medical reasons (12 days/year)
- `Vacation Leave`: Planned vacation (21 days/year)
- `Emergency Leave`: Urgent situations (5 days/year)
- `Maternity Leave`: New mothers (90 days)
- `Paternity Leave`: New fathers (15 days)
- `Personal Leave`: Personal matters (3 days/year)
- `Compensatory Leave`: Overtime compensation (10 days/year)
- `Bereavement Leave`: Family loss (3 days/year)

### Leave Status Options
- `Pending`: Awaiting admin review
- `Approved`: Leave approved by admin
- `Rejected`: Leave denied by admin
- `Cancelled`: Leave cancelled by applicant

---

## 🔒 Access Control

### Admin Permissions
- Mark and update any staff attendance
- View all attendance records and statistics
- Review (approve/reject) leave applications
- View all leave applications and statistics
- Access admin-only endpoints

### Staff Permissions
- View own attendance records only
- View own attendance statistics
- Apply for leave
- View own leave applications
- Cancel own pending leaves
- View team leave calendar

---

## 📊 Common Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Validation Error Response
```json
{
  "success": false,
  "message": "Validation errors",
  "errors": [
    {
      "field": "startDate",
      "message": "Valid start date is required (YYYY-MM-DD)"
    }
  ]
}
```

### Pagination Response
```json
{
  "success": true,
  "data": [ /* array of items */ ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

---

## 🚀 Getting Started

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Seed sample data:**
   ```bash
   npm run seed
   ```

3. **Login with admin credentials:**
   - Email: `admin@hcl-squad11.com`
   - Password: `Admin123`

4. **Test attendance marking:**
   ```bash
   curl -X POST http://localhost:3000/api/attendance/mark \
     -H "Authorization: Bearer <jwt_token>" \
     -H "Content-Type: application/json" \
     -d '{
       "staffId": "64a1b2c3d4e5f6789abc123d",
       "shiftId": "64a1b2c3d4e5f6789abc123e",
       "date": "2024-01-15",
       "status": "Present",
       "checkInTime": "09:00",
       "checkOutTime": "17:00"
     }'
   ```

5. **Test leave application:**
   ```bash
   curl -X POST http://localhost:3000/api/leaves/apply \
     -H "Authorization: Bearer <jwt_token>" \
     -H "Content-Type: application/json" \
     -d '{
       "leaveType": "Sick Leave",
       "startDate": "2024-02-01",
       "endDate": "2024-02-03",
       "reason": "Medical appointment with specialist doctor"
     }'
   ```

---

## 🎯 Key Features

### Attendance Management
✅ **Real-time attendance tracking** with check-in/out times  
✅ **Automatic late/early calculations** based on shift timings  
✅ **Hours worked calculation** with overtime detection  
✅ **Attendance statistics** and reporting  
✅ **Department-wise attendance summaries**  
✅ **Integration with shift and leave management**

### Leave Management
✅ **Comprehensive leave application system** with multiple leave types  
✅ **Admin approval workflow** with comments and replacement staff  
✅ **Leave balance tracking** with yearly entitlements  
✅ **Automatic shift conflict detection** and resolution  
✅ **Team leave calendar** for better planning  
✅ **Emergency leave handling** with priority processing

---

## 🔧 Advanced Features

### Smart Calculations
- **Automatic hours calculation** from check-in/out times
- **Late entry detection** with minute-level precision
- **Early exit tracking** for shift compliance
- **Overnight shift support** for 24/7 operations

### Leave Intelligence
- **Overlap prevention** stops conflicting leave requests
- **Shift integration** automatically removes staff from affected shifts
- **Balance tracking** prevents over-allocation of leave days
- **Replacement management** for seamless shift coverage

### Reporting & Analytics
- **Attendance percentage** calculations
- **Department-wise summaries** for management insights
- **Leave pattern analysis** for workforce planning
- **Custom date range reports** for flexible reporting

This comprehensive API provides a complete solution for healthcare staff attendance and leave management with enterprise-grade features and security. 