const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    shiftType: {
      type: String,
      required: true,
      enum: ["Morning", "Afternoon", "Night"],
    },
    startTime: {
      type: String,
      required: true,
      // Format: "HH:MM" (24-hour format)
    },
    endTime: {
      type: String,
      required: true,
      // Format: "HH:MM" (24-hour format)
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      default: 5,
    },
    assignedStaff: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    department: {
      type: String,
      required: true,
      enum: [
        "General",
        "Emergency",
        "ICU",
        "Surgery",
        "Pediatrics",
        "Maternity",
      ],
    },
    status: {
      type: String,
      enum: ["Open", "Full", "Closed"],
      default: "Open",
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for efficient queries
shiftSchema.index({ date: 1, shiftType: 1, department: 1 });
shiftSchema.index({ assignedStaff: 1 });

// Virtual for available slots
shiftSchema.virtual("availableSlots").get(function () {
  return this.capacity - this.assignedStaff.length;
});

// Virtual to check if shift is full
shiftSchema.virtual("isFull").get(function () {
  return this.assignedStaff.length >= this.capacity;
});

// Auto-update status based on capacity
shiftSchema.pre("save", function (next) {
  if (this.assignedStaff.length >= this.capacity) {
    this.status = "Full";
  } else if (
    this.status === "Full" &&
    this.assignedStaff.length < this.capacity
  ) {
    this.status = "Open";
  }
  next();
});

// Method to add staff to shift
shiftSchema.methods.addStaff = function (staffId) {
  if (
    !this.assignedStaff.includes(staffId) &&
    this.assignedStaff.length < this.capacity
  ) {
    this.assignedStaff.push(staffId);
    return true;
  }
  return false;
};

// Method to remove staff from shift
shiftSchema.methods.removeStaff = function (staffId) {
  const index = this.assignedStaff.indexOf(staffId);
  if (index > -1) {
    this.assignedStaff.splice(index, 1);
    return true;
  }
  return false;
};

// Static method to find shifts by date range
shiftSchema.statics.findByDateRange = function (startDate, endDate) {
  return this.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  }).populate("assignedStaff", "name email role");
};

// Static method to find conflicting shifts for a staff member
shiftSchema.statics.findConflicts = function (
  staffId,
  date,
  startTime,
  endTime
) {
  return this.find({
    date: date,
    assignedStaff: staffId,
    $or: [
      {
        $and: [
          { startTime: { $lte: startTime } },
          { endTime: { $gt: startTime } },
        ],
      },
      {
        $and: [{ startTime: { $lt: endTime } }, { endTime: { $gte: endTime } }],
      },
      {
        $and: [
          { startTime: { $gte: startTime } },
          { endTime: { $lte: endTime } },
        ],
      },
    ],
  });
};

module.exports = mongoose.model("Shift", shiftSchema);
