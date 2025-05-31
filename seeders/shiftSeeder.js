const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Shift = require('../models/Shift');
const User = require('../models/User');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ MongoDB connected for seeding');
    }
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    throw error;
  }
};

// Sample shift data
const getShiftData = adminId => {
  const shifts = [];

  // Morning shifts
  shifts.push({
    shiftType: 'Morning',
    startTime: '06:00',
    endTime: '14:00',
    requiredStaff: 8,
    department: 'General',
    description: 'General morning shift',
    createdBy: adminId,
  });

  shifts.push({
    shiftType: 'Morning',
    startTime: '07:00',
    endTime: '15:00',
    requiredStaff: 6,
    department: 'Emergency',
    description: 'Emergency morning shift',
    createdBy: adminId,
  });

  shifts.push({
    shiftType: 'Morning',
    startTime: '08:00',
    endTime: '16:00',
    requiredStaff: 4,
    department: 'ICU',
    description: 'ICU morning shift',
    createdBy: adminId,
  });

  // Afternoon shifts
  shifts.push({
    shiftType: 'Afternoon',
    startTime: '14:00',
    endTime: '22:00',
    requiredStaff: 8,
    department: 'General',
    description: 'General afternoon shift',
    createdBy: adminId,
  });

  shifts.push({
    shiftType: 'Afternoon',
    startTime: '15:00',
    endTime: '23:00',
    requiredStaff: 6,
    department: 'Emergency',
    description: 'Emergency afternoon shift',
    createdBy: adminId,
  });

  shifts.push({
    shiftType: 'Afternoon',
    startTime: '14:00',
    endTime: '22:00',
    requiredStaff: 5,
    department: 'Surgery',
    description: 'Surgery afternoon shift',
    createdBy: adminId,
  });

  // Night shifts
  shifts.push({
    shiftType: 'Night',
    startTime: '22:00',
    endTime: '06:00',
    requiredStaff: 5,
    department: 'General',
    description: 'General night shift',
    createdBy: adminId,
  });

  shifts.push({
    shiftType: 'Night',
    startTime: '23:00',
    endTime: '07:00',
    requiredStaff: 4,
    department: 'Emergency',
    description: 'Emergency night shift',
    createdBy: adminId,
  });

  shifts.push({
    shiftType: 'Night',
    startTime: '22:00',
    endTime: '06:00',
    requiredStaff: 3,
    department: 'ICU',
    description: 'ICU night shift',
    createdBy: adminId,
  });

  // Special shifts
  shifts.push({
    shiftType: 'Morning',
    startTime: '09:00',
    endTime: '17:00',
    requiredStaff: 3,
    department: 'Pediatrics',
    description: 'Pediatrics morning shift',
    createdBy: adminId,
  });

  shifts.push({
    shiftType: 'Afternoon',
    startTime: '13:00',
    endTime: '21:00',
    requiredStaff: 3,
    department: 'Maternity',
    description: 'Maternity afternoon shift',
    createdBy: adminId,
  });

  return shifts;
};

const seedShifts = async () => {
  try {
    await connectDB();

    console.log('🗑️  Clearing existing shifts...');
    await Shift.deleteMany({});

    console.log('👤 Finding admin user...');
    const admin = await User.findOne({ role: 'admin' });

    if (!admin) {
      throw new Error('No admin user found. Please run admin seeder first');
    }

    console.log('📋 Creating sample shifts...');
    const shiftData = getShiftData(admin._id);

    const shifts = await Shift.insertMany(shiftData);

    console.log(`✅ Successfully created ${shifts.length} shifts`);

    // Display summary
    const summary = {};
    shifts.forEach(shift => {
      const key = `${shift.shiftType} - ${shift.department}`;
      summary[key] = (summary[key] || 0) + 1;
    });

    console.log('\n📊 Shift Summary:');
    Object.entries(summary).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} shifts`);
    });

    return {
      success: true,
      message: `Successfully created ${shifts.length} shifts`,
      shifts: shifts,
      summary: summary,
    };
  } catch (error) {
    console.error('❌ Error seeding shifts:', error.message);
    throw error;
  }
};

// Only run directly if this file is executed directly
if (require.main === module) {
  seedShifts()
    .then(() => {
      console.log('\n🎯 You can now:');
      console.log('   • View shifts: GET /api/shifts');
      console.log('   • Assign staff: POST /api/shifts/:id/assign');
      console.log('   • Check conflicts: GET /api/shifts/conflicts');
      console.log('   • Filter by department: GET /api/shifts?department=Emergency');
      console.log('   • Filter by shift type: GET /api/shifts?shiftType=Morning');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Seeding failed:', error.message);
      process.exit(1);
    });
}

// Handle uncaught promise rejections
process.on('unhandledRejection', err => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  process.exit(1);
});

module.exports = seedShifts;
