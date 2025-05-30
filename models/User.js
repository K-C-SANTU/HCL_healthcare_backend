const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
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
    active: {
      type: Number,
      default: 1,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      required: true,
      enum: [
        "admin",
        "doctor",
        "nurse",
        "receptionist",
        "pharmacist",
        "technician",
      ],
    },
    createdBy: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
userSchema.index({ email: 1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  // Only hash if password is modified
  if (!this.isModified("password")) {
    this.updatedBy = new Date();
    return next();
  }

  try {
    // Hash password with cost of 10
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.updatedBy = new Date();
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
