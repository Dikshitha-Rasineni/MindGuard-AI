const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

function calcBurnoutScore({ workHours, meetingHours, focusHours, breaksToday, emailSentiment, lateNightWork }) {
  let score = 0;
  score += Math.min((workHours || 0) / 60 * 40, 40);
  score += Math.min((meetingHours || 0) / 30 * 20, 20);
  score += Math.max(0, (100 - (emailSentiment || 50)) / 100 * 15);
  score += (lateNightWork || 0) / 100 * 15;
  score -= Math.min((breaksToday || 0) * 2, 10);
  score -= Math.min((focusHours || 0) / 40 * 10, 10);
  return Math.round(Math.max(0, Math.min(100, score)));
}

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const logs = user.wellnessLogs || [];
    const last30 = logs.slice(-30);
    const latest = last30[last30.length - 1] || {};

    const contributingFactors = [
      { label: 'Meeting Load', value: Math.min(Math.round((latest.meetingHours || 0) / 30 * 100), 100), color: '#EF4444' },
      { label: 'Late Night Work', value: latest.lateNightWork || 0, color: '#3B82F6' },
      { label: 'Email Negativity', value: latest.emailSentiment ? Math.round(100 - latest.emailSentiment) : 0, color: '#F59E0B' },
      { label: 'Low Breaks', value: Math.max(0, 100 - (latest.breaksToday || 0) * 25), color: '#8B5CF6' },
    ];

    const workloadBalance = {
      focus: latest.focusHours || 0,
      meetings: latest.meetingHours || 0,
      other: Math.max(0, (latest.workHours || 0) - (latest.focusHours || 0) - (latest.meetingHours || 0)),
    };

    const recentScores = last30.slice(-5).map(l => l.burnoutScore || 0);
    const avgRecent = recentScores.length ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length : 0;
    const trend = recentScores.length > 1 ? recentScores[recentScores.length - 1] - recentScores[0] : 0;
    const predictions = [1, 2, 3].map(day => ({
      day: `Day +${day}`,
      score: Math.round(Math.max(0, Math.min(100, avgRecent + trend * day * 0.3))),
    }));

    const productivity = Math.round(Math.max(0, Math.min(100, ((latest.focusHours || 0) / ((latest.workHours || 1))) * 100)));
    const stressLevel = latest.burnoutScore || 0;

    res.json({ user: { name: user.name }, latest, logs: last30, contributingFactors, workloadBalance, predictions, productivity, stressLevel });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/log', auth, async (req, res) => {
  try {
    const { workHours, meetingHours, focusHours, breaksToday, emailSentiment, lateNightWork, timeOfDay } = req.body;
    const burnoutScore = calcBurnoutScore(req.body);
    const user = await User.findById(req.user.id);
    user.wellnessLogs.push({ workHours, meetingHours, focusHours, breaksToday, emailSentiment, lateNightWork, burnoutScore, timeOfDay });
    await user.save();
    res.json({ burnoutScore, message: 'Logged successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
