const express = require("express");
const { body, param, query } = require("express-validator");
const { protect, authorize } = require("../middleware/auth");
const {
  applyLeave,
  reviewLeave,
  getLeaves,
  getLeaveById,
  cancelLeave,
  getLeaveStats,
  getTeamLeaveCalendar,
  getPendingLeaves,
} = require("../controllers/leaveController");

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Validation middleware
const validateApplyLeave = [
  body("staffId")
    .optional()
    .isMongoId()
    .withMessage("Valid staff ID is required"),
  body("leaveType")
    .isIn([
      "Sick Leave",
      "Vacation Leave",
      "Emergency Leave",
      "Maternity Leave",
      "Paternity Leave",
      "Personal Leave",
      "Compensatory Leave",
      "Bereavement Leave",
    ])
    .withMessage("Invalid leave type"),
  body("startDate")
    .isISO8601()
    .withMessage("Valid start date is required (YYYY-MM-DD)"),
  body("endDate")
    .isISO8601()
    .withMessage("Valid end date is required (YYYY-MM-DD)")
    .custom((endDate, { req }) => {
      if (new Date(endDate) < new Date(req.body.startDate)) {
        throw new Error("End date must be after or equal to start date");
      }
      return true;
    }),
  body("reason")
    .notEmpty()
    .withMessage("Reason is required")
    .isLength({ min: 10, max: 1000 })
    .withMessage("Reason must be between 10 and 1000 characters"),
  body("isEmergency")
    .optional()
    .isBoolean()
    .withMessage("isEmergency must be a boolean"),
  body("handoverNotes")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Handover notes must be less than 1000 characters"),
  body("emergencyContact.name")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Emergency contact name must be between 2 and 100 characters"),
  body("emergencyContact.phone")
    .optional()
    .isMobilePhone()
    .withMessage("Valid emergency contact phone number is required"),
  body("emergencyContact.relationship")
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage(
      "Emergency contact relationship must be between 2 and 50 characters"
    ),
];

const validateReviewLeave = [
  param("id").isMongoId().withMessage("Valid leave ID is required"),
  body("status")
    .isIn(["Approved", "Rejected"])
    .withMessage("Status must be either Approved or Rejected"),
  body("reviewComments")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Review comments must be less than 500 characters"),
  body("replacementStaff")
    .optional()
    .isArray()
    .withMessage("Replacement staff must be an array"),
  body("replacementStaff.*.shiftId")
    .optional()
    .isMongoId()
    .withMessage("Valid shift ID is required for replacement staff"),
  body("replacementStaff.*.staffId")
    .optional()
    .isMongoId()
    .withMessage("Valid staff ID is required for replacement staff"),
];

const validateGetLeaves = [
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
  query("status")
    .optional()
    .isIn(["Pending", "Approved", "Rejected", "Cancelled"])
    .withMessage("Invalid leave status"),
  query("leaveType")
    .optional()
    .isIn([
      "Sick Leave",
      "Vacation Leave",
      "Emergency Leave",
      "Maternity Leave",
      "Paternity Leave",
      "Personal Leave",
      "Compensatory Leave",
      "Bereavement Leave",
    ])
    .withMessage("Invalid leave type"),
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Valid start date is required (YYYY-MM-DD)"),
  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("Valid end date is required (YYYY-MM-DD)"),
  query("department")
    .optional()
    .isIn(["General", "Emergency", "ICU", "Surgery", "Pediatrics", "Maternity"])
    .withMessage("Invalid department"),
];

const validateLeaveById = [
  param("id").isMongoId().withMessage("Valid leave ID is required"),
];

const validateLeaveStats = [
  param("staffId").isMongoId().withMessage("Valid staff ID is required"),
  query("year")
    .optional()
    .isInt({ min: 2020, max: 2030 })
    .withMessage("Year must be between 2020 and 2030"),
];

const validateTeamCalendar = [
  query("startDate")
    .isISO8601()
    .withMessage("Valid start date is required (YYYY-MM-DD)"),
  query("endDate")
    .isISO8601()
    .withMessage("Valid end date is required (YYYY-MM-DD)"),
  query("department")
    .optional()
    .isIn(["General", "Emergency", "ICU", "Surgery", "Pediatrics", "Maternity"])
    .withMessage("Invalid department"),
];

// Routes

// Apply for leave
router.post("/apply", validateApplyLeave, applyLeave);

// Review leave (Admin only)
router.put("/review/:id", authorize("admin"), validateReviewLeave, reviewLeave);

// Get leave applications with filtering
router.get("/", validateGetLeaves, getLeaves);

// Get leave by ID
router.get("/:id", validateLeaveById, getLeaveById);

// Cancel leave application
router.put("/cancel/:id", validateLeaveById, cancelLeave);

// Get leave statistics for a staff member
router.get("/stats/:staffId", validateLeaveStats, getLeaveStats);

// Get team leave calendar
router.get("/calendar/team", validateTeamCalendar, getTeamLeaveCalendar);

// Get pending leave applications (Admin only)
router.get("/admin/pending", authorize("admin"), getPendingLeaves);

module.exports = router;
