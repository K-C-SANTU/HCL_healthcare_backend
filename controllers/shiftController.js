const Shift = require("../models/Shift");
const User = require("../models/User");
const { validationResult } = require("express-validator");

// Get all shifts with filtering and pagination
const getAllShifts = async (req, res) => {
  try {
    const { page = 1, limit = 10, shiftType, department, status } = req.query;

    // Build filter object
    const filter = {};

    if (shiftType) filter.shiftType = shiftType;
    if (department) filter.department = department;
    if (status) filter.status = status;

    const shifts = await Shift.find(filter)
      .populate("assignedStaff", "name email role phone")
      .populate("createdBy", "name email")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ shiftType: 1, startTime: 1 });

    const total = await Shift.countDocuments(filter);

    res.json({
      success: true,
      data: shifts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching shifts",
      error: error.message,
    });
  }
};

// Get shift by ID
const getShiftById = async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id)
      .populate("assignedStaff", "name email role phone")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found",
      });
    }

    res.json({
      success: true,
      data: shift,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching shift",
      error: error.message,
    });
  }
};

// Create new shift
const createShift = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const shiftData = {
      ...req.body,
      createdBy: req.user.id,
    };

    const shift = new Shift(shiftData);
    await shift.save();

    const populatedShift = await Shift.findById(shift._id)
      .populate("assignedStaff", "name email role")
      .populate("createdBy", "name email");

    res.status(201).json({
      success: true,
      message: "Shift created successfully",
      data: populatedShift,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating shift",
      error: error.message,
    });
  }
};

// Update shift
const updateShift = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const updateData = {
      ...req.body,
      updatedBy: req.user.id,
    };

    const shift = await Shift.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("assignedStaff", "name email role")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found",
      });
    }

    res.json({
      success: true,
      message: "Shift updated successfully",
      data: shift,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating shift",
      error: error.message,
    });
  }
};

// Delete shift
const deleteShift = async (req, res) => {
  try {
    const shift = await Shift.findByIdAndDelete(req.params.id);

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found",
      });
    }

    res.json({
      success: true,
      message: "Shift deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting shift",
      error: error.message,
    });
  }
};

// Assign staff to shift
const assignStaff = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { staffIds } = req.body;
    const shiftId = req.params.id;

    const shift = await Shift.findById(shiftId);
    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found",
      });
    }

    // Check available capacity
    const availableSlots = shift.requiredStaff - shift.assignedStaff.length;
    if (staffIds.length > availableSlots) {
      return res.status(400).json({
        success: false,
        message: `Only ${availableSlots} slots available, but trying to assign ${staffIds.length} staff`,
      });
    }

    // Check for conflicts and validate staff existence
    const conflictResults = [];
    const validStaffIds = [];

    for (const staffId of staffIds) {
      // Check if staff exists
      const staff = await User.findById(staffId);
      if (!staff) {
        return res.status(404).json({
          success: false,
          message: `Staff with ID ${staffId} not found`,
        });
      }

      // Check if already assigned to this shift
      if (shift.assignedStaff.includes(staffId)) {
        return res.status(400).json({
          success: false,
          message: `Staff ${staff.name} is already assigned to this shift`,
        });
      }

      // Check for time conflicts - updated to not require date
      const conflicts = await Shift.findConflicts(
        staffId,
        shift.startTime,
        shift.endTime
      ).populate("assignedStaff", "name email role");

      if (conflicts.length > 0) {
        conflictResults.push({
          staffId,
          staffName: staff.name,
          conflicts: conflicts.map((c) => ({
            shiftId: c._id,
            shiftType: c.shiftType,
            startTime: c.startTime,
            endTime: c.endTime,
            department: c.department,
          })),
        });
      } else {
        validStaffIds.push(staffId);
      }
    }

    // If there are conflicts, return them
    if (conflictResults.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Shift conflicts detected",
        conflicts: conflictResults,
      });
    }

    // Assign all valid staff
    shift.assignedStaff.push(...validStaffIds);
    shift.updatedBy = req.user.id;
    await shift.save();

    const updatedShift = await Shift.findById(shiftId)
      .populate("assignedStaff", "name email role phone")
      .populate("createdBy", "name email");

    res.json({
      success: true,
      message: `${validStaffIds.length} staff assigned successfully`,
      data: updatedShift,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error assigning staff",
      error: error.message,
    });
  }
};

// Remove staff from shift
const removeStaff = async (req, res) => {
  try {
    const { staffIds } = req.body;
    const shiftId = req.params.id;

    if (!Array.isArray(staffIds) || staffIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "staffIds must be a non-empty array",
      });
    }

    const shift = await Shift.findById(shiftId);
    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found",
      });
    }

    // Remove staff
    shift.assignedStaff = shift.assignedStaff.filter(
      (id) => !staffIds.includes(id.toString())
    );
    shift.updatedBy = req.user.id;

    await shift.save();

    const updatedShift = await Shift.findById(shiftId)
      .populate("assignedStaff", "name email role phone")
      .populate("createdBy", "name email");

    res.json({
      success: true,
      message: "Staff removed successfully",
      data: updatedShift,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error removing staff",
      error: error.message,
    });
  }
};

// Get shifts by department and shift type - replaces the date range function
const getShiftsByFilter = async (req, res) => {
  try {
    const { shiftType, department } = req.query;

    const filter = {};
    if (shiftType) filter.shiftType = shiftType;
    if (department) filter.department = department;

    const shifts = await Shift.find(filter)
      .populate("assignedStaff", "name email role")
      .sort({ shiftType: 1, startTime: 1 });

    res.json({
      success: true,
      data: shifts,
      count: shifts.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching shifts by filter",
      error: error.message,
    });
  }
};

// Get shifts for a specific staff member
const getStaffShifts = async (req, res) => {
  try {
    const { staffId } = req.params;

    const filter = {
      assignedStaff: staffId,
    };

    const shifts = await Shift.find(filter)
      .populate("assignedStaff", "name email role")
      .sort({ shiftType: 1, startTime: 1 });

    res.json({
      success: true,
      data: shifts,
      count: shifts.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching staff shifts",
      error: error.message,
    });
  }
};

// Check for shift conflicts - updated to remove date dependency
const checkConflicts = async (req, res) => {
  try {
    const { staffId, startTime, endTime } = req.query;

    if (!staffId || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "staffId, startTime, and endTime are required",
      });
    }

    const conflicts = await Shift.findConflicts(
      staffId,
      startTime,
      endTime
    ).populate("assignedStaff", "name email role");

    res.json({
      success: true,
      data: {
        hasConflicts: conflicts.length > 0,
        conflicts,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error checking conflicts",
      error: error.message,
    });
  }
};

module.exports = {
  getAllShifts,
  getShiftById,
  createShift,
  updateShift,
  deleteShift,
  assignStaff,
  removeStaff,
  getShiftsByFilter,
  getShiftsByDateRange: getShiftsByFilter,
  getStaffShifts,
  checkConflicts,
};
