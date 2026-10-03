const { execSync } = require('child_process');
const mongoose = require('mongoose');
require('dotenv').config();
const Course = require('./models/Course');

(async () => {
  try {
    console.log('\n=== 1. IMPORTING ALL COURSES ===\n');
    execSync('node .\\utils\\importAllCourses.js', { stdio: 'inherit' });

    console.log('\n=== 2. CHECKING DATABASE ===\n');

    await mongoose.connect(process.env.MONGODB_URI);

    const bad = await Course.find({
      platform: { $in: ['NPTEL', 'Coursera', 'edX'] }
    }).select('platform title status').lean();

    const active = await Course.countDocuments({
      status: { $ne: 'unavailable' },
      free: true
    });

    const platforms = await Course.aggregate([
      {
        $match: {
          status: { $ne: 'unavailable' },
          free: true
        }
      },
      {
        $group: {
          _id: '$platform',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    console.log('ACTIVE FREE COURSES:', active);
    console.log('\nPLATFORM COUNTS:');

    platforms.forEach(x => {
      console.log(`  ${x._id}: ${x.count}`);
    });

    console.log(
      '\nREMOVED PLATFORMS:',
      bad.length === 0 ? 'PASS' : `FOUND ${bad.length}`
    );

    if (bad.length) {
      bad.forEach(x => {
        console.log(`  ${x.platform} - ${x.title}`);
      });
    }

    await mongoose.disconnect();

    console.log('\n=== 3. BUILDING FRONTEND ===\n');

    execSync(
      'npm --prefix ..\\client run build',
      { stdio: 'inherit' }
    );

    console.log('\n=== 4. FINAL SYNTAX CHECK ===\n');

    execSync(
      'node --check .\\utils\\autoCourseImporter.js',
      { stdio: 'inherit' }
    );

    execSync(
      'node --check .\\utils\\swayamCourseImporter.js',
      { stdio: 'inherit' }
    );

    execSync(
      'node --check .\\utils\\importAllCourses.js',
      { stdio: 'inherit' }
    );

    console.log('\n======================================');
    console.log('SKILLHUB FINAL CHECK COMPLETE');
    console.log('======================================');

  } catch (error) {
    console.error('\nFINAL CHECK FAILED:', error.message);

    try {
      await mongoose.disconnect();
    } catch {}

    process.exit(1);
  }
})();
