const mongoose = require("mongoose");
const User = require("../models/User");
const connectDB = require("../config/database");
require("dotenv").config();

const seedAdmin = async () => {
  try {
    // Connect to database
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      email: "admin@hcl-squad11.com",
    });

    if (existingAdmin) {
      console.log("❌ Admin user already exists");
      process.exit(1);
    }

    // Create admin user
    const adminUser = await User.create({
      name: "System Administrator",
      email: "admin@hcl-squad11.com",
      phone: "+1234567890",
      password: "Admin123",
      role: "admin",
      active: 1,
    });

    console.log("✅ Admin user created successfully");
    console.log("📧 Email: admin@hcl-squad11.com");
    console.log("🔒 Password: Admin123");
    console.log("👤 Role: admin");
    console.log("⚠️  Please change the default password after first login!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Promise Rejection:", err.message);
  process.exit(1);
});

// Run seeder
seedAdmin();
