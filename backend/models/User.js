const mongoose = require('mongoose');

const WellnessLogSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  workHours: Number,
  meetingHours: Number,
  focusHours: Number,
  breaksToday: Number,
  emailSentiment: Number,
  lateNightWork: Number,
  burnoutScore: Number,
  timeOfDay: String,
});

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  wellnessLogs: [WellnessLogSchema],
});

module.exports = mongoose.model('User', UserSchema);
