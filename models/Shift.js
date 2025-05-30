const mongoose = require("mongoose");

/**
 * @swagger
 * components:
 *   schemas:
 *     Shift:
 *       type: object
 *       required:
 *         - shiftType
 *         - startTime
 *         - endTime
 *         - requiredStaff
 *         - department
 *         - createdBy
 *       properties:
 *         shiftType:
 *           type: string
 *           enum: [Morning, Afternoon, Night]
 *           description: Type of shift
 *         startTime:
 *           type: string
 *           pattern: ^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$
 *           description: Start time in HH:MM format (24-hour)
 *         endTime:
 *           type: string
 *           pattern: ^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$
 *           description: End time in HH:MM format (24-hour)
 *         requiredStaff:
 *           type: number
 *           minimum: 1
 *           maximum: 50
 *           description: Maximum number of staff that can be assigned
 *         assignedStaff:
 *           type: array
 *           items:
 *             type: string
 *             format: objectId
 *           description: List of staff IDs assigned to this shift
 *         department:
 *           type: string
 *           enum: [General, Emergency, ICU, Surgery, Pediatrics, Maternity]
 *           description: Department where the shift takes place
 *         status:
 *           type: string
 *           enum: [Open, Full, Closed]
 *           default: Open
 *           description: Current status of the shift
 *         description:
 *           type: string
 *           maxLength: 500
 *           description: Optional description or notes about the shift
 *         createdBy:
 *           type: string
 *           format: objectId
 *           description: ID of the user who created the shift
 *         updatedBy:
 *           type: string
 *           format: objectId
 *           description: ID of the user who last updated the shift
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the shift was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the shift was last updated
 *       example:
 *         shiftType: "Morning"
 *         startTime: "07:00"
 *         endTime: "15:00"
 *         requiredStaff: 5
 *         department: "General"
 *         status: "Open"
 *         description: "Regular morning shift in general ward"
 */

const shiftSchema = new mongoose.Schema(
  {
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
    requiredStaff: {
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
shiftSchema.index({ shiftType: 1, department: 1 });
shiftSchema.index({ assignedStaff: 1 });

// Virtual for available slots
shiftSchema.virtual("availableSlots").get(function () {
  return this.requiredStaff - this.assignedStaff.length;
});

// Virtual to check if shift is full
shiftSchema.virtual("isFull").get(function () {
  return this.assignedStaff.length >= this.requiredStaff;
});

// Auto-update status based on requiredStaff
shiftSchema.pre("save", function (next) {
  if (this.assignedStaff.length >= this.requiredStaff) {
    this.status = "Full";
  } else if (
    this.status === "Full" &&
    this.assignedStaff.length < this.requiredStaff
  ) {
    this.status = "Open";
  }
  next();
});

// Method to add staff to shift
shiftSchema.methods.addStaff = function (staffId) {
  if (
    !this.assignedStaff.includes(staffId) &&
    this.assignedStaff.length < this.requiredStaff
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

// Static method to find conflicting shifts for a staff member - updated to remove date dependency
shiftSchema.statics.findConflicts = function (staffId, startTime, endTime) {
  return this.find({
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
