const express = require("express");
const router = express.Router();
const {
  login,
  getMe,
  updatePassword,
} = require("../controllers/authController");
const {
  validateLogin,
  validatePasswordUpdate,
} = require("../middleware/validation");
const { protect } = require("../middleware/auth");

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", validateLogin, login);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get("/me", protect, getMe);

// @route   PUT /api/auth/updatepassword
// @desc    Update password
// @access  Private
router.put("/updatepassword", protect, validatePasswordUpdate, updatePassword);

module.exports = router;
