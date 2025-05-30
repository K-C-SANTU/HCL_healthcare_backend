const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      enum: [
        "Emergency",
        "Cardiology",
        "Neurology",
        "Pediatrics",
        "Surgery",
        "Radiology",
        "Laboratory",
        "Pharmacy",
        "Administration",
        "Nursing",
      ],
    },
    position: {
      type: String,
      required: true,
      enum: [
        "Doctor",
        "Nurse",
        "Technician",
        "Administrator",
        "Pharmacist",
        "Radiologist",
        "Lab Technician",
        "Surgeon",
        "Specialist",
      ],
    },
    dateOfJoining: {
      type: Date,
      required: true,
    },
    salary: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
staffSchema.index({ employeeId: 1 });
staffSchema.index({ email: 1 });
staffSchema.index({ department: 1 });
staffSchema.index({ position: 1 });

module.exports = mongoose.model("Staff", staffSchema);
