// Background job architecture for periodic course-link verification.
// In production this would run on a schedule (node-cron) and hit each course
// URL with a HEAD request, updating status accordingly.
const cron = require('node-cron');
const https = require('https');
const http = require('http');
const Course = require('../models/Course');

const checkUrl = (url) =>
  new Promise((resolve) => {
    try {
      const client = url.startsWith('https') ? https : http;
      const req = client.request(url, { method: 'HEAD', timeout: 8000 }, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve('active');
        else if (res.statusCode >= 300 && res.statusCode < 400) resolve('redirected');
        else resolve('broken');
      });
      req.on('error', () => resolve('broken'));
      req.on('timeout', () => { req.destroy(); resolve('broken'); });
      req.end();
    } catch {
      resolve('broken');
    }
  });

// Runs across all courses; marks broken links as 'unavailable' for admin review
// rather than deleting them, per spec.
const runLinkVerification = async () => {
  const courses = await Course.find({});
  for (const course of courses) {
    const status = await checkUrl(course.url);
    course.status = status === 'broken' ? 'unavailable' : status;
    course.lastChecked = new Date();
    await course.save();
  }
  console.log(`Link verification complete: ${courses.length} courses checked`);
};

// Call this once from server.js to schedule the job (default: daily at 3am).
// Kept off by default in dev so a fresh seed doesn't immediately get flagged
// unavailable because of sample/placeholder URLs.
const scheduleLinkVerification = () => {
  cron.schedule('0 3 * * *', () => {
    runLinkVerification().catch(err => console.error('Link verification failed:', err));
  });
};

module.exports = { runLinkVerification, scheduleLinkVerification, checkUrl };
