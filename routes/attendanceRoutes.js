const express = require("express");
const { body, param, query } = require("express-validator");
const { protect, authorize } = require("../middleware/auth");
const {
  markAttendance,
  updateAttendance,
  getAttendance,
  getAttendanceByDateRange,
  getStaffAttendanceStats,
  getDailyAttendanceSummary,
} = require("../controllers/attendanceController");

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Validation middleware
const validateMarkAttendance = [
  body("staffId").isMongoId().withMessage("Valid staff ID is required"),
  body("shiftId").isMongoId().withMessage("Valid shift ID is required"),
  body("date").isISO8601().withMessage("Valid date is required (YYYY-MM-DD)"),
  body("status")
    .isIn([
      "Present",
      "Absent",
      "Late",
      "Sick Leave",
      "Emergency Leave",
      "Half Day",
    ])
    .withMessage("Invalid attendance status"),
  body("checkInTime")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Check-in time must be in HH:MM format"),
  body("checkOutTime")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Check-out time must be in HH:MM format"),
  body("remarks")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Remarks must be less than 500 characters"),
  body("leaveId")
    .optional()
    .isMongoId()
    .withMessage("Valid leave ID is required"),
];

const validateUpdateAttendance = [
  param("id").isMongoId().withMessage("Valid attendance ID is required"),
  body("status")
    .optional()
    .isIn([
      "Present",
      "Absent",
      "Late",
      "Sick Leave",
      "Emergency Leave",
      "Half Day",
    ])
    .withMessage("Invalid attendance status"),
  body("checkInTime")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Check-in time must be in HH:MM format"),
  body("checkOutTime")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Check-out time must be in HH:MM format"),
  body("remarks")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Remarks must be less than 500 characters"),
];

const validateGetAttendance = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("staffId")
    .optional()
    .isMongoId()
    .withMessage("Valid staff ID is required"),
  query("shiftId")
    .optional()
    .isMongoId()
    .withMessage("Valid shift ID is required"),
  query("date")
    .optional()
    .isISO8601()
    .withMessage("Valid date is required (YYYY-MM-DD)"),
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Valid start date is required (YYYY-MM-DD)"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("Valid end date is required (YYYY-MM-DD)"),
  query("status")
    .optional()
    .isIn([
      "Present",
      "Absent",
      "Late",
      "Sick Leave",
      "Emergency Leave",
      "Half Day",
    ])
    .withMessage("Invalid attendance status"),
  query("department")
    .optional()
    .isIn(["General", "Emergency", "ICU", "Surgery", "Pediatrics", "Maternity"])
    .withMessage("Invalid department"),
];

const validateDateRange = [
  query("startDate")
    .isISO8601()
    .withMessage("Valid start date is required (YYYY-MM-DD)"),
  query("endDate")
    .isISO8601()
    .withMessage("Valid end date is required (YYYY-MM-DD)"),
  query("staffId")
    .optional()
    .isMongoId()
    .withMessage("Valid staff ID is required"),
  query("department")
    .optional()
    .isIn(["General", "Emergency", "ICU", "Surgery", "Pediatrics", "Maternity"])
    .withMessage("Invalid department"),
];

const validateStaffStats = [
  param("staffId").isMongoId().withMessage("Valid staff ID is required"),
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Valid start date is required (YYYY-MM-DD)"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("Valid end date is required (YYYY-MM-DD)"),
  query("year")
    .optional()
    .isInt({ min: 2020, max: 2030 })
    .withMessage("Year must be between 2020 and 2030"),
];

const validateDailySummary = [
  param("date").isISO8601().withMessage("Valid date is required (YYYY-MM-DD)"),
];

// Routes

// Mark attendance (Admin only)
router.post(
  "/mark",
  authorize("admin"),
  validateMarkAttendance,
  markAttendance
);

// Update attendance (Admin only)
router.put(
  "/:id",
  authorize("admin"),
  validateUpdateAttendance,
  updateAttendance
);

// Get attendance records with filtering
router.get("/", validateGetAttendance, getAttendance);

// Get attendance by date range
router.get("/date-range", validateDateRange, getAttendanceByDateRange);

// Get staff attendance statistics
router.get("/stats/:staffId", validateStaffStats, getStaffAttendanceStats);

// Get daily attendance summary (Admin only)
router.get(
  "/daily-summary/:date",
  authorize("admin"),
  validateDailySummary,
  getDailyAttendanceSummary
);

module.exports = router;
