const express = require("express");
const { body } = require("express-validator");
const {
  getAllShifts,
  getShiftById,
  createShift,
  updateShift,
  deleteShift,
  assignStaff,
  removeStaff,
  getShiftsByDateRange,
  getStaffShifts,
  checkConflicts,
} = require("../controllers/shiftController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Validation rules for shift creation
const createShiftValidation = [
  body("date")
    .isISO8601()
    .withMessage("Date must be in valid ISO format (YYYY-MM-DD)"),
  body("shiftType")
    .isIn(["Morning", "Afternoon", "Night"])
    .withMessage("Shift type must be Morning, Afternoon, or Night"),
  body("startTime")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Start time must be in HH:MM format (24-hour)"),
  body("endTime")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("End time must be in HH:MM format (24-hour)"),
  body("capacity")
    .isInt({ min: 1, max: 50 })
    .withMessage("Capacity must be between 1 and 50"),
  body("department")
    .isIn(["General", "Emergency", "ICU", "Surgery", "Pediatrics", "Maternity"])
    .withMessage("Invalid department"),
  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),
];

// Validation rules for shift update
const updateShiftValidation = [
  body("date")
    .optional()
    .isISO8601()
    .withMessage("Date must be in valid ISO format (YYYY-MM-DD)"),
  body("shiftType")
    .optional()
    .isIn(["Morning", "Afternoon", "Night"])
    .withMessage("Shift type must be Morning, Afternoon, or Night"),
  body("startTime")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Start time must be in HH:MM format (24-hour)"),
  body("endTime")
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("End time must be in HH:MM format (24-hour)"),
  body("capacity")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Capacity must be between 1 and 50"),
  body("department")
    .optional()
    .isIn(["General", "Emergency", "ICU", "Surgery", "Pediatrics", "Maternity"])
    .withMessage("Invalid department"),
  body("status")
    .optional()
    .isIn(["Open", "Full", "Closed"])
    .withMessage("Status must be Open, Full, or Closed"),
  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),
];

// Validation for staff assignment
const staffAssignmentValidation = [
  body("staffIds")
    .isArray({ min: 1 })
    .withMessage("staffIds must be a non-empty array"),
  body("staffIds.*")
    .isMongoId()
    .withMessage("Each staff ID must be a valid MongoDB ObjectId"),
];

// Apply auth protection and admin authorization to all routes
router.use(protect);
router.use(authorize("admin"));

// GET routes
router.get("/", getAllShifts);
router.get("/date-range", getShiftsByDateRange);
router.get("/conflicts", checkConflicts);
router.get("/staff/:staffId", getStaffShifts);
router.get("/:id", getShiftById);

// POST routes
router.post("/", createShiftValidation, createShift);
router.post("/:id/assign", staffAssignmentValidation, assignStaff);

// PUT routes
router.put("/:id", updateShiftValidation, updateShift);
router.put("/:id/remove-staff", staffAssignmentValidation, removeStaff);

// DELETE routes
router.delete("/:id", deleteShift);

module.exports = router;
