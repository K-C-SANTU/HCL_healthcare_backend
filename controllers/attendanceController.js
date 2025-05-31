const Attendance = require('../models/Attendance');
const Shift = require('../models/Shift');
const User = require('../models/User');
const Leave = require('../models/Leave');
const { validationResult } = require('express-validator');

// Mark attendance for a staff member
const markAttendance = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array(),
      });
    }

    const { staffId, shiftId, date, status, checkInTime, checkOutTime, remarks, leaveId } =
      req.body;

    // Check if attendance already exists for this staff and date
    const existingAttendance = await Attendance.findOne({
      staffId,
      date: new Date(date),
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already marked for this date',
        data: existingAttendance,
      });
    }

    // Validate shift exists
    const shift = await Shift.findById(shiftId);
    if (!shift) {
      return res.status(404).json({
        success: false,
        message: 'Shift not found',
      });
    }

    // Validate staff exists
    const staff = await User.findById(staffId);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found',
      });
    }

    // Calculate scheduled hours based on shift
    const shiftStartTime = shift.startTime;
    const shiftEndTime = shift.endTime;
    const scheduledHours = calculateShiftHours(shiftStartTime, shiftEndTime);

    // Create attendance record
    const attendanceData = {
      staffId,
      shiftId,
      date: new Date(date),
      status,
      scheduledHoursWorked: scheduledHours,
      markedBy: req.user.id,
      remarks,
    };

    // Add check-in/out times if provided
    if (checkInTime) {
      attendanceData.checkInTime = checkInTime;

      // Calculate late entry
      const lateInfo = calculateLateEntry(checkInTime, shiftStartTime);
      attendanceData.isLateEntry = lateInfo.isLate;
      attendanceData.lateByMinutes = lateInfo.minutes;
    }

    if (checkOutTime) {
      attendanceData.checkOutTime = checkOutTime;

      // Calculate early exit
      const earlyInfo = calculateEarlyExit(checkOutTime, shiftEndTime);
      attendanceData.isEarlyExit = earlyInfo.isEarly;
      attendanceData.earlyByMinutes = earlyInfo.minutes;
    }

    // Add leave reference if applicable
    if (leaveId && (status === 'Sick Leave' || status === 'Emergency Leave')) {
      attendanceData.leaveId = leaveId;
    }

    const attendance = new Attendance(attendanceData);
    await attendance.save();

    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('staffId', 'name email role phone')
      .populate('shiftId', 'shiftType startTime endTime department')
      .populate('markedBy', 'name email')
      .populate('leaveId', 'leaveType reason');

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: populatedAttendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking attendance',
      error: error.message,
    });
  }
};

// Update attendance (for corrections)
const updateAttendance = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const updateData = { ...req.body, markedBy: req.user.id };

    // If updating check-in/out times, recalculate late/early flags
    if (updateData.checkInTime || updateData.checkOutTime) {
      const attendance = await Attendance.findById(id).populate('shiftId');
      if (attendance && attendance.shiftId) {
        if (updateData.checkInTime) {
          const lateInfo = calculateLateEntry(updateData.checkInTime, attendance.shiftId.startTime);
          updateData.isLateEntry = lateInfo.isLate;
          updateData.lateByMinutes = lateInfo.minutes;
        }

        if (updateData.checkOutTime) {
          const earlyInfo = calculateEarlyExit(updateData.checkOutTime, attendance.shiftId.endTime);
          updateData.isEarlyExit = earlyInfo.isEarly;
          updateData.earlyByMinutes = earlyInfo.minutes;
        }
      }
    }

    const attendance = await Attendance.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('staffId', 'name email role phone')
      .populate('shiftId', 'shiftType startTime endTime department')
      .populate('markedBy', 'name email')
      .populate('leaveId', 'leaveType reason');

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    res.json({
      success: true,
      message: 'Attendance updated successfully',
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating attendance',
      error: error.message,
    });
  }
};

// Get attendance records with filtering
const getAttendance = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      staffId,
      shiftId,
      date,
      startDate,
      endDate,
      status,
      department,
    } = req.query;

    // Build filter object
    const filter = {};

    if (staffId) filter.staffId = staffId;
    if (shiftId) filter.shiftId = shiftId;

    if (date) {
      filter.date = new Date(date);
    } else if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (status) filter.status = status;

    // Build aggregation pipeline for department filtering
    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'shifts',
          localField: 'shiftId',
          foreignField: '_id',
          as: 'shift',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'staffId',
          foreignField: '_id',
          as: 'staff',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'markedBy',
          foreignField: '_id',
          as: 'marker',
        },
      },
    ];

    if (department) {
      pipeline.push({
        $match: { 'shift.department': department },
      });
    }

    pipeline.push(
      { $sort: { date: -1, createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) }
    );

    const attendance = await Attendance.aggregate(pipeline);
    const total = await Attendance.countDocuments(filter);

    res.json({
      success: true,
      data: attendance,
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
      message: 'Error fetching attendance',
      error: error.message,
    });
  }
};

// Get attendance by date range
const getAttendanceByDateRange = async (req, res) => {
  try {
    const { startDate, endDate, staffId, department } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate are required',
      });
    }

    const filters = {};
    if (staffId) filters.staffId = staffId;

    const attendance = await Attendance.findByDateRange(
      new Date(startDate),
      new Date(endDate),
      filters
    );

    // Filter by department if specified
    let filteredAttendance = attendance;
    if (department) {
      filteredAttendance = attendance.filter(
        record => record.shiftId && record.shiftId.department === department
      );
    }

    res.json({
      success: true,
      data: filteredAttendance,
      count: filteredAttendance.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance by date range',
      error: error.message,
    });
  }
};

// Get staff attendance statistics
const getStaffAttendanceStats = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { startDate, endDate, year } = req.query;

    let start, end;

    if (year) {
      start = new Date(year, 0, 1);
      end = new Date(year, 11, 31);
    } else if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      // Default to current month
      const now = new Date();
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    const stats = await Attendance.getAttendanceStats(staffId, start, end);

    // Calculate totals
    const totals = {
      totalDays: 0,
      totalHours: 0,
      presentDays: 0,
      absentDays: 0,
      lateDays: 0,
      leavesDays: 0,
    };

    stats.forEach(stat => {
      totals.totalDays += stat.count;
      totals.totalHours += stat.totalHours;

      switch (stat._id) {
        case 'Present':
          totals.presentDays = stat.count;
          break;
        case 'Absent':
          totals.absentDays = stat.count;
          break;
        case 'Late':
          totals.lateDays = stat.count;
          break;
        case 'Sick Leave':
        case 'Emergency Leave':
          totals.leavesDays += stat.count;
          break;
      }
    });

    // Calculate attendance percentage
    const attendancePercentage =
      totals.totalDays > 0
        ? Math.round(((totals.presentDays + totals.lateDays) / totals.totalDays) * 100)
        : 0;

    res.json({
      success: true,
      data: {
        period: { startDate: start, endDate: end },
        statistics: stats,
        summary: {
          ...totals,
          attendancePercentage,
          averageHoursPerDay:
            totals.totalDays > 0
              ? Math.round((totals.totalHours / totals.totalDays) * 100) / 100
              : 0,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance statistics',
      error: error.message,
    });
  }
};

// Get daily attendance summary
const getDailyAttendanceSummary = async (req, res) => {
  try {
    const { date } = req.params;
    const targetDate = new Date(date);

    const summary = await Attendance.aggregate([
      {
        $match: {
          date: targetDate,
        },
      },
      {
        $lookup: {
          from: 'shifts',
          localField: 'shiftId',
          foreignField: '_id',
          as: 'shift',
        },
      },
      {
        $unwind: '$shift',
      },
      {
        $group: {
          _id: {
            department: '$shift.department',
            status: '$status',
          },
          count: { $sum: 1 },
          totalHours: { $sum: '$actualHoursWorked' },
        },
      },
      {
        $group: {
          _id: '$_id.department',
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count',
              totalHours: '$totalHours',
            },
          },
          totalStaff: { $sum: '$count' },
          totalHours: { $sum: '$totalHours' },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        date: targetDate,
        departments: summary,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching daily attendance summary',
      error: error.message,
    });
  }
};

// Helper functions
const calculateShiftHours = (startTime, endTime) => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMinute;
  let endMinutes = endHour * 60 + endMinute;

  // Handle overnight shifts
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }

  return Math.round(((endMinutes - startMinutes) / 60) * 100) / 100;
};

const calculateLateEntry = (checkInTime, shiftStartTime) => {
  const [shiftHour, shiftMinute] = shiftStartTime.split(':').map(Number);
  const [checkInHour, checkInMinute] = checkInTime.split(':').map(Number);

  const shiftStartMinutes = shiftHour * 60 + shiftMinute;
  const checkInMinutes = checkInHour * 60 + checkInMinute;

  const lateness = checkInMinutes - shiftStartMinutes;

  return {
    isLate: lateness > 0,
    minutes: Math.max(0, lateness),
  };
};

const calculateEarlyExit = (checkOutTime, shiftEndTime) => {
  const [shiftHour, shiftMinute] = shiftEndTime.split(':').map(Number);
  const [checkOutHour, checkOutMinute] = checkOutTime.split(':').map(Number);

  let shiftEndMinutes = shiftHour * 60 + shiftMinute;
  let checkOutMinutes = checkOutHour * 60 + checkOutMinute;

  // Handle overnight shifts
  if (shiftEndMinutes < 12 * 60) {
    shiftEndMinutes += 24 * 60;
  }
  if (checkOutMinutes < 12 * 60) {
    checkOutMinutes += 24 * 60;
  }

  const earlyLeave = shiftEndMinutes - checkOutMinutes;

  return {
    isEarly: earlyLeave > 0,
    minutes: Math.max(0, earlyLeave),
  };
};

module.exports = {
  markAttendance,
  updateAttendance,
  getAttendance,
  getAttendanceByDateRange,
  getStaffAttendanceStats,
  getDailyAttendanceSummary,
};
