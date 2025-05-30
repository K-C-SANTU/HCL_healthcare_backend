const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    leaveType: {
      type: String,
      required: true,
      enum: [
        "Sick Leave",
        "Vacation Leave",
        "Emergency Leave",
        "Maternity Leave",
        "Paternity Leave",
        "Personal Leave",
        "Compensatory Leave",
        "Bereavement Leave",
      ],
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    numberOfDays: {
      type: Number,
      required: true,
      min: 0.5, // Allow half days
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Approved", "Rejected", "Cancelled"],
      default: "Pending",
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    reviewedDate: {
      type: Date,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Admin who approved/rejected
    },
    reviewComments: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    isEmergency: {
      type: Boolean,
      default: false,
    },
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    handoverNotes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },
    affectedShifts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shift",
      },
    ],
    replacementStaff: [
      {
        shiftId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Shift",
        },
        staffId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient queries
leaveSchema.index({ staffId: 1, status: 1 });
leaveSchema.index({ startDate: 1, endDate: 1 });
leaveSchema.index({ status: 1, appliedDate: 1 });
leaveSchema.index({ leaveType: 1, status: 1 });

// Virtual for leave duration in readable format
leaveSchema.virtual("duration").get(function () {
  if (this.numberOfDays === 1) {
    return "1 day";
  } else if (this.numberOfDays === 0.5) {
    return "Half day";
  } else {
    return `${this.numberOfDays} days`;
  }
});

// Virtual to check if leave is current/active
leaveSchema.virtual("isActive").get(function () {
  const today = new Date();
  return (
    this.status === "Approved" &&
    this.startDate <= today &&
    this.endDate >= today
  );
});

// Virtual to check if leave is upcoming
leaveSchema.virtual("isUpcoming").get(function () {
  const today = new Date();
  return this.status === "Approved" && this.startDate > today;
});

// Method to calculate number of working days
leaveSchema.methods.calculateWorkingDays = function () {
  let count = 0;
  let currentDate = new Date(this.startDate);
  const endDate = new Date(this.endDate);

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    // Count weekdays only (Monday = 1, Friday = 5)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return count;
};

// Method to check for overlapping leaves
leaveSchema.methods.checkOverlap = function () {
  return this.constructor.find({
    staffId: this.staffId,
    _id: { $ne: this._id }, // Exclude current leave
    status: { $in: ["Pending", "Approved"] },
    $or: [
      {
        startDate: { $lte: this.endDate },
        endDate: { $gte: this.startDate },
      },
    ],
  });
};

// Pre-save middleware to calculate numberOfDays
leaveSchema.pre("save", function (next) {
  if (this.isModified("startDate") || this.isModified("endDate")) {
    // Calculate number of days
    const timeDifference = this.endDate.getTime() - this.startDate.getTime();
    const dayDifference = Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1;
    this.numberOfDays = dayDifference;
  }

  next();
});

// Static method to get leave statistics
leaveSchema.statics.getLeaveStats = function (staffId, year) {
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31);

  return this.aggregate([
    {
      $match: {
        staffId: new mongoose.Types.ObjectId(staffId),
        startDate: { $gte: startOfYear },
        endDate: { $lte: endOfYear },
        status: "Approved",
      },
    },
    {
      $group: {
        _id: "$leaveType",
        totalDays: { $sum: "$numberOfDays" },
        count: { $sum: 1 },
      },
    },
  ]);
};

// Static method to get team leave calendar
leaveSchema.statics.getTeamLeaveCalendar = function (
  startDate,
  endDate,
  department = null
) {
  const matchConditions = {
    startDate: { $lte: endDate },
    endDate: { $gte: startDate },
    status: "Approved",
  };

  const pipeline = [
    { $match: matchConditions },
    {
      $lookup: {
        from: "users",
        localField: "staffId",
        foreignField: "_id",
        as: "staff",
      },
    },
    { $unwind: "$staff" },
  ];

  if (department) {
    pipeline.push({
      $match: { "staff.department": department },
    });
  }

  pipeline.push({
    $project: {
      staffName: "$staff.name",
      staffRole: "$staff.role",
      leaveType: 1,
      startDate: 1,
      endDate: 1,
      numberOfDays: 1,
      reason: 1,
    },
  });

  return this.aggregate(pipeline);
};

// Static method to find leaves by date range
leaveSchema.statics.findByDateRange = function (
  startDate,
  endDate,
  filters = {}
) {
  const matchConditions = {
    $or: [
      {
        startDate: { $gte: startDate, $lte: endDate },
      },
      {
        endDate: { $gte: startDate, $lte: endDate },
      },
      {
        startDate: { $lte: startDate },
        endDate: { $gte: endDate },
      },
    ],
    ...filters,
  };

  return this.find(matchConditions)
    .populate("staffId", "name email role phone")
    .populate("reviewedBy", "name email")
    .populate("affectedShifts", "date shiftType department")
    .populate("replacementStaff.staffId", "name role")
    .sort({ appliedDate: -1 });
};

// Static method to check leave balance
leaveSchema.statics.getLeaveBalance = function (
  staffId,
  year,
  leaveType = null
) {
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31);

  const matchConditions = {
    staffId: new mongoose.Types.ObjectId(staffId),
    startDate: { $gte: startOfYear, $lte: endOfYear },
    status: "Approved",
  };

  if (leaveType) {
    matchConditions.leaveType = leaveType;
  }

  return this.aggregate([
    { $match: matchConditions },
    {
      $group: {
        _id: leaveType ? null : "$leaveType",
        totalDaysUsed: { $sum: "$numberOfDays" },
        count: { $sum: 1 },
      },
    },
  ]);
};

module.exports = mongoose.model("Leave", leaveSchema);
