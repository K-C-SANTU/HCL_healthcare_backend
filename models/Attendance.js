const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shiftId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: [
        "Present",
        "Absent",
        "Late",
        "Sick Leave",
        "Emergency Leave",
        "Half Day",
      ],
      default: "Present",
    },
    checkInTime: {
      type: String, // Format: "HH:MM"
      required: function () {
        return (
          this.status === "Present" ||
          this.status === "Late" ||
          this.status === "Half Day"
        );
      },
    },
    checkOutTime: {
      type: String, // Format: "HH:MM"
      required: false,
    },
    actualHoursWorked: {
      type: Number, // Hours worked (calculated from check-in/out)
      default: 0,
    },
    scheduledHoursWorked: {
      type: Number, // Expected hours based on shift
      default: 8,
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Admin who marked the attendance
    },
    markedAt: {
      type: Date,
      default: Date.now,
    },
    isLateEntry: {
      type: Boolean,
      default: false,
    },
    lateByMinutes: {
      type: Number,
      default: 0,
    },
    isEarlyExit: {
      type: Boolean,
      default: false,
    },
    earlyByMinutes: {
      type: Number,
      default: 0,
    },
    leaveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Leave",
      required: function () {
        return (
          this.status === "Sick Leave" || this.status === "Emergency Leave"
        );
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create compound indexes for efficient queries
attendanceSchema.index({ staffId: 1, date: 1 });
attendanceSchema.index({ shiftId: 1, date: 1 });
attendanceSchema.index({ date: 1, status: 1 });

// Virtual for attendance percentage
attendanceSchema.virtual("attendancePercentage").get(function () {
  if (this.scheduledHoursWorked === 0) return 0;
  return Math.round((this.actualHoursWorked / this.scheduledHoursWorked) * 100);
});

// Method to calculate actual hours worked
attendanceSchema.methods.calculateHoursWorked = function () {
  if (!this.checkInTime || !this.checkOutTime) {
    return 0;
  }

  const [checkInHour, checkInMinute] = this.checkInTime.split(":").map(Number);
  const [checkOutHour, checkOutMinute] = this.checkOutTime
    .split(":")
    .map(Number);

  const checkInMinutes = checkInHour * 60 + checkInMinute;
  let checkOutMinutes = checkOutHour * 60 + checkOutMinute;

  // Handle overnight shifts
  if (checkOutMinutes < checkInMinutes) {
    checkOutMinutes += 24 * 60; // Add 24 hours
  }

  const totalMinutes = checkOutMinutes - checkInMinutes;
  return Math.round((totalMinutes / 60) * 100) / 100; // Round to 2 decimal places
};

// Method to calculate late entry
attendanceSchema.methods.calculateLateEntry = function (shiftStartTime) {
  if (!this.checkInTime || !shiftStartTime)
    return { isLate: false, minutes: 0 };

  const [shiftHour, shiftMinute] = shiftStartTime.split(":").map(Number);
  const [checkInHour, checkInMinute] = this.checkInTime.split(":").map(Number);

  const shiftStartMinutes = shiftHour * 60 + shiftMinute;
  const checkInMinutes = checkInHour * 60 + checkInMinute;

  const lateness = checkInMinutes - shiftStartMinutes;

  return {
    isLate: lateness > 0,
    minutes: Math.max(0, lateness),
  };
};

// Method to calculate early exit
attendanceSchema.methods.calculateEarlyExit = function (shiftEndTime) {
  if (!this.checkOutTime || !shiftEndTime)
    return { isEarly: false, minutes: 0 };

  const [shiftHour, shiftMinute] = shiftEndTime.split(":").map(Number);
  const [checkOutHour, checkOutMinute] = this.checkOutTime
    .split(":")
    .map(Number);

  let shiftEndMinutes = shiftHour * 60 + shiftMinute;
  let checkOutMinutes = checkOutHour * 60 + checkOutMinute;

  // Handle overnight shifts
  if (shiftEndMinutes < shiftHour * 60 + shiftMinute) {
    shiftEndMinutes += 24 * 60;
  }
  if (checkOutMinutes < checkOutHour * 60 + checkOutMinute) {
    checkOutMinutes += 24 * 60;
  }

  const earlyLeave = shiftEndMinutes - checkOutMinutes;

  return {
    isEarly: earlyLeave > 0,
    minutes: Math.max(0, earlyLeave),
  };
};

// Pre-save middleware to calculate fields
attendanceSchema.pre("save", function (next) {
  // Calculate actual hours worked
  this.actualHoursWorked = this.calculateHoursWorked();

  next();
});

// Static method to get attendance statistics
attendanceSchema.statics.getAttendanceStats = function (
  staffId,
  startDate,
  endDate
) {
  return this.aggregate([
    {
      $match: {
        staffId: new mongoose.Types.ObjectId(staffId),
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalHours: { $sum: "$actualHoursWorked" },
      },
    },
  ]);
};

// Static method to find attendance by date range
attendanceSchema.statics.findByDateRange = function (
  startDate,
  endDate,
  filters = {}
) {
  const matchConditions = {
    date: {
      $gte: startDate,
      $lte: endDate,
    },
    ...filters,
  };

  return this.find(matchConditions)
    .populate("staffId", "name email role phone")
    .populate("shiftId", "shiftType startTime endTime department")
    .populate("markedBy", "name email")
    .populate("leaveId", "leaveType reason")
    .sort({ date: -1, createdAt: -1 });
};

module.exports = mongoose.model("Attendance", attendanceSchema);
