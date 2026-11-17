// Create (or reset) a demo account with two weeks of sample wellness logs.
// Usage (from the backend folder): node scripts/seed-demo.js
// Optional: DEMO_EMAIL=... DEMO_PASSWORD=... node scripts/seed-demo.js
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('../db/connect');
const User = require('../models/User');

const EMAIL = (process.env.DEMO_EMAIL || 'demo@mindguard.app').toLowerCase();
const PASSWORD = process.env.DEMO_PASSWORD || 'mindguard-demo';

function score({ workHours, meetingHours, focusHours, breaksToday, emailSentiment, lateNightWork }) {
  let s = 0;
  s += Math.min(workHours / 60 * 40, 40);
  s += Math.min(meetingHours / 30 * 20, 20);
  s += Math.max(0, (100 - emailSentiment) / 100 * 15);
  s += lateNightWork / 100 * 15;
  s -= Math.min(breaksToday * 2, 10);
  s -= Math.min(focusHours / 40 * 10, 10);
  return Math.round(Math.max(0, Math.min(100, s)));
}

(async () => {
  await connectDB();
  const times = ['Morning', 'Afternoon', 'Evening'];
  const logs = Array.from({ length: 14 }, (_, i) => {
    const t = i / 13; // workload creeps up over the fortnight, so the trend chart has a story
    const l = {
      date: new Date(Date.now() - (13 - i) * 86400000),
      workHours: Math.round(38 + t * 14),
      meetingHours: Math.round(10 + t * 12),
      focusHours: Math.round(14 - t * 8),
      breaksToday: Math.max(0, Math.round(4 - t * 3)),
      emailSentiment: Math.round(70 - t * 35),
      lateNightWork: Math.round(10 + t * 45),
      timeOfDay: times[i % 3],
    };
    return { ...l, burnoutScore: score(l) };
  });
  const password = await bcrypt.hash(PASSWORD, 10);
  await User.findOneAndUpdate(
    { email: EMAIL },
    { name: 'Demo User', email: EMAIL, password, wellnessLogs: logs },
    { upsert: true, new: true },
  );
  console.log(`Demo account ready: ${EMAIL} / ${PASSWORD} (14 days of sample logs)`);
  await mongoose.disconnect();
})().catch(err => { console.error(err.message); process.exit(1); });
