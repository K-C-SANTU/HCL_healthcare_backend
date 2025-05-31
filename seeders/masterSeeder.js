const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load individual seeders
const seedAdmin = require('./adminSeeder');
const seedShifts = require('./shiftSeeder');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected for master seeding');
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

const masterSeeder = async () => {
  try {
    console.log('🚀 Starting Master Seeder...\n');
    console.log('=' * 50);

    await connectDB();

    // Step 1: Seed Admin User
    console.log('📝 Step 1: Seeding Admin User...');
    try {
      await seedAdmin();
      console.log('✅ Admin user seeded successfully\n');
    } catch (error) {
      if (error.message.includes('Admin user already exists')) {
        console.log('ℹ️  Admin user already exists, skipping...\n');
      } else {
        throw error;
      }
    }

    // Step 2: Seed Shifts
    console.log('📅 Step 2: Seeding Shifts...');
    try {
      await seedShifts();
      console.log('✅ Shifts seeded successfully\n');
    } catch (error) {
      console.error('❌ Error seeding shifts:', error.message);
      throw error;
    }

    console.log('=' * 50);
    console.log('🎉 Master Seeding Completed Successfully!');
    console.log('\n📊 Summary:');
    console.log('   ✅ Admin user ready');
    console.log('   ✅ Sample shifts created');
    console.log('   ✅ Core system operational');

    console.log('\n🎯 Next Steps:');
    console.log('   1. Start the server: npm run dev');
    console.log('   2. Login with admin credentials:');
    console.log('      Email: admin@hcl-squad11.com');
    console.log('      Password: Admin123');
    console.log('   3. Test the APIs using the documentation');

    console.log('\n🔗 API Endpoints Available:');
    console.log('   • Authentication: /api/auth/*');
    console.log('   • User Management: /api/users/*');
    console.log('   • Shift Management: /api/shifts/*');
    console.log('   • Attendance Management: /api/attendance/*');
    console.log('   • Leave Management: /api/leaves/*');

    console.log('\n💡 Note:');
    console.log('   Attendance and leave data can be created via API endpoints');
    console.log('   Use the comprehensive API documentation for testing');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Master Seeding Failed:', error.message);
    console.error('💡 Try running individual seeders:');
    console.error('   npm run seed:admin');
    console.error('   npm run seed:shifts');
    process.exit(1);
  }
};

// Handle uncaught promise rejections
process.on('unhandledRejection', err => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', err => {
  console.error('❌ Uncaught Exception:', err.message);
  process.exit(1);
});

// Run the master seeder
if (require.main === module) {
  masterSeeder();
}

module.exports = masterSeeder;
