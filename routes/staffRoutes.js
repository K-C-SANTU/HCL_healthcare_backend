const express = require("express");
const router = express.Router();
const {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffByDepartment,
} = require("../controllers/staffController");
const {
  validateStaff,
  validateStaffUpdate,
} = require("../middleware/validation");

// @route   GET /api/staff
// @desc    Get all staff members with pagination and filtering
// @access  Public
router.get("/", getAllStaff);

// @route   GET /api/staff/:id
// @desc    Get staff member by ID
// @access  Public
router.get("/:id", getStaffById);

// @route   GET /api/staff/department/:department
// @desc    Get staff members by department
// @access  Public
router.get("/department/:department", getStaffByDepartment);

// @route   POST /api/staff
// @desc    Create new staff member
// @access  Public
router.post("/", validateStaff, createStaff);

// @route   PUT /api/staff/:id
// @desc    Update staff member
// @access  Public
router.put("/:id", validateStaffUpdate, updateStaff);

// @route   DELETE /api/staff/:id
// @desc    Delete staff member
// @access  Public
router.delete("/:id", deleteStaff);

module.exports = router;
