const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUsersByRole,
} = require("../controllers/userController");
const {
  validateUser,
  validateUserUpdate,
} = require("../middleware/validation");
const { protect, authorize } = require("../middleware/auth");

// @route   GET /api/users
// @desc    Get all users with pagination and filtering
// @access  Private - Admin only
router.get("/", protect, authorize("admin"), getAllUsers);

// @route   GET /api/users/role/:role
// @desc    Get users by role
// @access  Private - Admin only
router.get("/role/:role", protect, authorize("admin"), getUsersByRole);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private - Admin only
router.get("/:id", protect, authorize("admin"), getUserById);

// @route   POST /api/users
// @desc    Create new user
// @access  Private - Admin only
router.post("/", protect, authorize("admin"), validateUser, createUser);

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private - Admin only
router.put("/:id", protect, authorize("admin"), validateUserUpdate, updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private - Admin only
router.delete("/:id", protect, authorize("admin"), deleteUser);

module.exports = router;
