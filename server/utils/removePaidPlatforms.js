require('dotenv').config();

const connectDB = require('../config/db');
const Course = require('../models/Course');

async function removePaidPlatforms() {
  try {
    await connectDB();

    const result = await Course.deleteMany({
      platform: {
        $in: ['Coursera', 'edX']
      }
    });

    console.log('Removed Coursera/edX courses:', result.deletedCount);

    process.exit(0);
  } catch (error) {
    console.error('Cleanup failed:', error.message);
    process.exit(1);
  }
}

removePaidPlatforms();