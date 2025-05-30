const Staff = require("../models/Staff");
const { validationResult } = require("express-validator");

// Get all staff members
const getAllStaff = async (req, res) => {
  try {
    const { page = 1, limit = 10, department, position, isActive } = req.query;

    // Build filter object
    const filter = {};
    if (department) filter.department = department;
    if (position) filter.position = position;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const staff = await Staff.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Staff.countDocuments(filter);

    res.json({
      success: true,
      data: staff,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching staff members",
      error: error.message,
    });
  }
};

// Get staff member by ID
const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    res.json({
      success: true,
      data: staff,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching staff member",
      error: error.message,
    });
  }
};

// Create new staff member
const createStaff = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const staff = new Staff(req.body);
    await staff.save();

    res.status(201).json({
      success: true,
      message: "Staff member created successfully",
      data: staff,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Employee ID or email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating staff member",
      error: error.message,
    });
  }
};

// Update staff member
const updateStaff = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    res.json({
      success: true,
      message: "Staff member updated successfully",
      data: staff,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Employee ID or email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating staff member",
      error: error.message,
    });
  }
};

// Delete staff member
const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    res.json({
      success: true,
      message: "Staff member deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting staff member",
      error: error.message,
    });
  }
};

// Get staff by department
const getStaffByDepartment = async (req, res) => {
  try {
    const { department } = req.params;
    const staff = await Staff.find({ department, isActive: true });

    res.json({
      success: true,
      data: staff,
      count: staff.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching staff by department",
      error: error.message,
    });
  }
};

module.exports = {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffByDepartment,
};
