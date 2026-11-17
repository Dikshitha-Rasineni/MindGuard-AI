// Set a new password for an existing account.
// Usage (from the backend folder): node scripts/reset-password.js you@example.com newPassword123
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('../db/connect');
const User = require('../models/User');

(async () => {
  const [email, password] = process.argv.slice(2);
  if (!email || !password) {
    console.log('Usage: node scripts/reset-password.js <email> <new-password>');
    process.exit(1);
  }
  if (password.length < 6) { console.log('Password must be at least 6 characters.'); process.exit(1); }
  await connectDB();
  const re = new RegExp(`^${email.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
  const user = await User.findOne({ email: re });
  if (!user) {
    const all = await User.find({}, 'email').lean();
    console.log(`No account found for ${email}.`);
    console.log(all.length ? `Accounts in this database:\n  ${all.map(u => u.email).join('\n  ')}` : 'This database has no accounts yet.');
    process.exit(1);
  }
  user.password = await bcrypt.hash(password, 10);
  await user.save();
  console.log(`Password updated for ${user.email}. You can log in now.`);
  await mongoose.disconnect();
})().catch(err => { console.error(err.message); process.exit(1); });
