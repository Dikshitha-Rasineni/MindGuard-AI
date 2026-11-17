const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const MIN_PASSWORD = 6;
const normEmail = (e) => String(e || '').trim().toLowerCase();
const sign = (user) => jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
const publicUser = (user) => ({ name: user.name, email: user.email });

router.post('/signup', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = normEmail(req.body.email);
    const password = String(req.body.password || '');
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Enter a valid email address' });
    if (password.length < MIN_PASSWORD) return res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD} characters` });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'An account with this email already exists' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    res.json({ token: sign(user), user: publicUser(user) });
  } catch (err) {
    console.error('signup error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = normEmail(req.body.email);
    const password = String(req.body.password || '');
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    // Older accounts may have been saved with capital letters in the email.
    const user = await User.findOne({ email }) ||
      await User.findOne({ email: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Wrong email or password' });
    }
    res.json({ token: sign(user), user: publicUser(user) });
  } catch (err) {
    console.error('login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
