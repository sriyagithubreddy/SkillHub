require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { scheduleLinkVerification } = require('./jobs/linkChecker');

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const savedCourseRoutes = require('./routes/savedCourses');
const certificateRoutes = require('./routes/certificates');
const profileRoutes = require('./routes/profile');
const portfolioRoutes = require('./routes/portfolio');
const resumeRoutes = require('./routes/resume');
const adminRoutes = require('./routes/admin');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

app.disable('x-powered-by');
app.set('trust proxy', 1);

const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map(value => value.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // Same-origin browser requests and non-browser health checks have no Origin header.
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS origin not allowed'));
  },
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' }
});
app.use('/api', generalLimiter);

app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbReady = mongoose.connection.readyState === 1;
  res.status(dbReady ? 200 : 503).json({
    status: dbReady ? 'ok' : 'degraded',
    database: dbReady ? 'connected' : 'disconnected',
    time: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/saved-courses', savedCourseRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/admin', adminRoutes);

// In production the Express server can serve the built React app, allowing the
// whole project to be deployed as one Render web service.
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (isProduction) {
  app.use(express.static(clientDist, { index: false, maxAge: '1d' }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(clientDist, 'index.html'), err => err && next(err));
  });
}

app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5000;

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`SkillHub API running on port ${PORT}`));
    if (isProduction) scheduleLinkVerification();
  } catch (err) {
    console.error(`Startup failed: ${err.message}`);
    process.exit(1);
  }
};

if (require.main === module) start();

module.exports = app;
