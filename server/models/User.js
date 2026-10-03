const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' }
}, { _id: true });

const educationSchema = new mongoose.Schema({
  degree: String,
  college: String,
  branch: String,
  cgpa: String,
  startYear: String,
  endYear: String
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8 },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  username: { type: String, unique: true, sparse: true, trim: true },
  phone: String,
  location: String,
  linkedin: String,
  github: String,
  portfolio: String,
  photoUrl: String,
  summary: String,
  interests: [{ type: String }],
  education: { type: [educationSchema], default: [] },
  skills: { type: [skillSchema], default: [] },
  isPublicProfile: { type: Boolean, default: false },
  achievements: [{ type: String }],
  extraActivities: [{ type: String }]
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
