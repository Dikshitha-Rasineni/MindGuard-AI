require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./db/connect');

if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET is not set: logins will fail. See backend/.env.example');
}

const app = express();
app.use(cors());
app.use(express.json());

const health = (req, res) => res.json({ message: 'MindGuard API running' });
app.get('/', health);
app.get('/api', health);

// Every API route needs the database.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('MongoDB error:', err.message);
    res.status(503).json({ message: 'Database unavailable. Please try again in a moment.' });
  }
});

// Mounted at /api/* (Vercel) and at /* (local server and older app builds).
for (const prefix of ['/api', '']) {
  app.use(`${prefix}/auth`, require('./routes/auth'));
  app.use(`${prefix}/dashboard`, require('./routes/dashboard'));
  app.use(`${prefix}/ai`, require('./routes/ai'));
}

module.exports = app;
