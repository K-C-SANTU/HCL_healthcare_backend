const Leave = require("../models/Leave");
const User = require("../models/User");
const Shift = require("../models/Shift");
const { validationResult } = require("express-validator");

// Apply for leave
const applyLeave = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const {
      leaveType,
      startDate,
      endDate,
      reason,
      isEmergency,
      handoverNotes,
      emergencyContact,
    } = req.body;

    // For non-admin users, set staffId to their own ID
    const staffId = req.user.role === "admin" ? req.body.staffId : req.user.id;

    // Validate staff exists
    const staff = await User.findById(staffId);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    // Check for overlapping leaves
    const overlappingLeaves = await Leave.find({
      staffId,
      status: { $in: ["Pending", "Approved"] },
      $or: [
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) },
        },
      ],
    });

    if (overlappingLeaves.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Leave dates overlap with existing leave request",
        overlappingLeaves,
      });
    }

    // Find affected shifts
    const affectedShifts = await Shift.find({
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
      assignedStaff: staffId,
    });

    // Create leave application
    const leaveData = {
      staffId,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      isEmergency: isEmergency || false,
      handoverNotes,
      emergencyContact,
      affectedShifts: affectedShifts.map((shift) => shift._id),
    };

    const leave = new Leave(leaveData);
    await leave.save();

    const populatedLeave = await Leave.findById(leave._id)
      .populate("staffId", "name email role phone")
      .populate(
        "affectedShifts",
        "date shiftType department startTime endTime"
      );

    res.status(201).json({
      success: true,
      message: "Leave application submitted successfully",
      data: populatedLeave,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error applying for leave",
      error: error.message,
    });
  }
};

// Review leave (approve/reject)
const reviewLeave = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { status, reviewComments, replacementStaff } = req.body;

    // Only admin can review leaves
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can review leave applications",
      });
    }

    const leave = await Leave.findById(id);
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave application not found",
      });
    }

    if (leave.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Leave application has already been reviewed",
      });
    }

    // Update leave status
    leave.status = status;
    leave.reviewedBy = req.user.id;
    leave.reviewedDate = new Date();
    leave.reviewComments = reviewComments;

    if (replacementStaff && replacementStaff.length > 0) {
      leave.replacementStaff = replacementStaff;
    }

    await leave.save();

    // If approved, update affected shifts to remove the staff
    if (status === "Approved" && leave.affectedShifts.length > 0) {
      await Shift.updateMany(
        { _id: { $in: leave.affectedShifts } },
        { $pull: { assignedStaff: leave.staffId } }
      );

      // Add replacement staff if provided
      if (replacementStaff && replacementStaff.length > 0) {
        for (const replacement of replacementStaff) {
          await Shift.findByIdAndUpdate(replacement.shiftId, {
            $push: { assignedStaff: replacement.staffId },
          });
        }
      }
    }

    const populatedLeave = await Leave.findById(leave._id)
      .populate("staffId", "name email role phone")
      .populate("reviewedBy", "name email")
      .populate("affectedShifts", "date shiftType department")
      .populate("replacementStaff.staffId", "name role");

    res.json({
      success: true,
      message: `Leave application ${status.toLowerCase()} successfully`,
      data: populatedLeave,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error reviewing leave application",
      error: error.message,
    });
  }
};

// Get leave applications with filtering
const getLeaves = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      staffId,
      status,
      leaveType,
      startDate,
      endDate,
      department,
    } = req.query;

    // Build filter object
    const filter = {};

    // Non-admin users can only see their own leaves
    if (req.user.role !== "admin") {
      filter.staffId = req.user.id;
    } else if (staffId) {
      filter.staffId = staffId;
    }

    if (status) filter.status = status;
    if (leaveType) filter.leaveType = leaveType;

    if (startDate && endDate) {
      filter.$or = [
        {
          startDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
        {
          endDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
        {
          startDate: { $lte: new Date(startDate) },
          endDate: { $gte: new Date(endDate) },
        },
      ];
    }

    // Build aggregation pipeline for department filtering
    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: "users",
          localField: "staffId",
          foreignField: "_id",
          as: "staff",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "reviewedBy",
          foreignField: "_id",
          as: "reviewer",
        },
      },
    ];

    if (department) {
      pipeline.push({
        $match: { "staff.department": department },
      });
    }

    pipeline.push(
      { $sort: { appliedDate: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) }
    );

    const leaves = await Leave.aggregate(pipeline);
    const total = await Leave.countDocuments(filter);

    res.json({
      success: true,
      data: leaves,
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
      message: "Error fetching leave applications",
      error: error.message,
    });
  }
};

// Get leave by ID
const getLeaveById = async (req, res) => {
  try {
    const { id } = req.params;

    const leave = await Leave.findById(id)
      .populate("staffId", "name email role phone department")
      .populate("reviewedBy", "name email")
      .populate("affectedShifts", "date shiftType department startTime endTime")
      .populate("replacementStaff.staffId", "name role");

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave application not found",
      });
    }

    // Non-admin users can only view their own leaves
    if (
      req.user.role !== "admin" &&
      leave.staffId._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.json({
      success: true,
      data: leave,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching leave application",
      error: error.message,
    });
  }
};

// Cancel leave application
const cancelLeave = async (req, res) => {
  try {
    const { id } = req.params;

    const leave = await Leave.findById(id);
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave application not found",
      });
    }

    // Check if user can cancel this leave
    if (req.user.role !== "admin" && leave.staffId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (leave.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Leave application is already cancelled",
      });
    }

    if (leave.status === "Approved" && new Date() >= leave.startDate) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel approved leave that has already started",
      });
    }

    // Update leave status
    leave.status = "Cancelled";
    await leave.save();

    // If leave was approved, restore staff to affected shifts
    if (leave.status === "Approved") {
      await Shift.updateMany(
        { _id: { $in: leave.affectedShifts } },
        { $push: { assignedStaff: leave.staffId } }
      );

      // Remove replacement staff
      if (leave.replacementStaff.length > 0) {
        for (const replacement of leave.replacementStaff) {
          await Shift.findByIdAndUpdate(replacement.shiftId, {
            $pull: { assignedStaff: replacement.staffId },
          });
        }
      }
    }

    const populatedLeave = await Leave.findById(leave._id)
      .populate("staffId", "name email role phone")
      .populate("reviewedBy", "name email");

    res.json({
      success: true,
      message: "Leave application cancelled successfully",
      data: populatedLeave,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error cancelling leave application",
      error: error.message,
    });
  }
};

// Get leave statistics for a staff member
const getLeaveStats = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { year = new Date().getFullYear() } = req.query;

    // Non-admin users can only view their own stats
    if (req.user.role !== "admin" && staffId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const stats = await Leave.getLeaveStats(staffId, parseInt(year));

    // Calculate leave balance (assuming 21 days annual leave)
    const leaveEntitlements = {
      "Sick Leave": 12,
      "Vacation Leave": 21,
      "Emergency Leave": 5,
      "Personal Leave": 3,
      "Maternity Leave": 90,
      "Paternity Leave": 15,
      "Compensatory Leave": 10,
      "Bereavement Leave": 3,
    };

    const balances = {};
    let totalUsed = 0;
    let totalEntitled = 0;

    Object.keys(leaveEntitlements).forEach((leaveType) => {
      const used = stats.find((stat) => stat._id === leaveType)?.totalDays || 0;
      const entitled = leaveEntitlements[leaveType];

      balances[leaveType] = {
        entitled,
        used,
        remaining: entitled - used,
      };

      totalUsed += used;
      totalEntitled += entitled;
    });

    res.json({
      success: true,
      data: {
        year: parseInt(year),
        summary: {
          totalEntitled,
          totalUsed,
          totalRemaining: totalEntitled - totalUsed,
        },
        leaveTypes: balances,
        detailedStats: stats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching leave statistics",
      error: error.message,
    });
  }
};

// Get team leave calendar
const getTeamLeaveCalendar = async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate are required",
      });
    }

    const calendar = await Leave.getTeamLeaveCalendar(
      new Date(startDate),
      new Date(endDate),
      department
    );

    res.json({
      success: true,
      data: calendar,
      count: calendar.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching team leave calendar",
      error: error.message,
    });
  }
};

// Get pending leave applications (for admin dashboard)
const getPendingLeaves = async (req, res) => {
  try {
    // Only admin can access this endpoint
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const pendingLeaves = await Leave.find({ status: "Pending" })
      .populate("staffId", "name email role phone department")
      .populate("affectedShifts", "date shiftType department")
      .sort({ appliedDate: 1 }); // Oldest first

    // Categorize by urgency
    const urgent = pendingLeaves.filter(
      (leave) =>
        leave.isEmergency ||
        new Date(leave.startDate) - new Date() <= 2 * 24 * 60 * 60 * 1000 // Within 2 days
    );

    const regular = pendingLeaves.filter(
      (leave) =>
        !leave.isEmergency &&
        new Date(leave.startDate) - new Date() > 2 * 24 * 60 * 60 * 1000
    );

    res.json({
      success: true,
      data: {
        urgent,
        regular,
        total: pendingLeaves.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching pending leave applications",
      error: error.message,
    });
  }
};

module.exports = {
  applyLeave,
  reviewLeave,
  getLeaves,
  getLeaveById,
  cancelLeave,
  getLeaveStats,
  getTeamLeaveCalendar,
  getPendingLeaves,
};
