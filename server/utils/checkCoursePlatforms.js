require('dotenv').config();

const connectDB = require('../config/db');
const Course = require('../models/Course');

async function checkPlatforms() {
  try {
    await connectDB();

    const counts = await Course.aggregate([
      {
        $group: {
          _id: '$platform',
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          _id: 1
        }
      }
    ]);

    console.table(counts);

    process.exit(0);
  } catch (error) {
    console.error('Check failed:', error.message);
    process.exit(1);
  }
}

checkPlatforms();