const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

router.post('/insight', auth, async (req, res) => {
  const { burnoutScore, workHours, meetingHours, emailSentiment, focusHours, breaksToday, lateNightWork } = req.body;

  let message = '';
  let urgency = 'low';

  if (burnoutScore >= 75) {
    urgency = 'critical';
    message = `High burnout risk detected (score: ${burnoutScore}). Working ${workHours} hrs/week is well above sustainable levels. You need to act today.`;
  } else if (burnoutScore >= 50) {
    urgency = 'moderate';
    message = `Moderate burnout risk (score: ${burnoutScore}). You are trending in a concerning direction. Small changes now will prevent bigger issues.`;
  } else {
    urgency = 'low';
    message = `You are in good shape (score: ${burnoutScore})! Keep maintaining your current habits and stay consistent.`;
  }

  const suggestions = [];
  if (meetingHours > 20) suggestions.push({ text: 'Cancel one meeting today', sub: `Currently at ${meetingHours} hrs/week`, icon: '📅' });
  if (workHours > 45) suggestions.push({ text: 'Stop work by 7 PM tonight', sub: `${workHours} hrs is above sustainable`, icon: '🕖' });
  if ((emailSentiment || 50) < 40) suggestions.push({ text: 'Talk to your manager about workload', sub: 'Reduces cortisol by ~20%', icon: '💬' });
  if ((breaksToday || 0) < 2) suggestions.push({ text: 'Take a 5 min break now', sub: 'Recommended every 90 mins', icon: '☕' });
  if ((lateNightWork || 0) > 30) suggestions.push({ text: 'Do not open laptop after 8 PM', sub: 'Late work disrupts sleep cycles', icon: '🌙' });
  if ((focusHours || 0) < 2) suggestions.push({ text: 'Block 2hrs for deep focus work', sub: 'Improves productivity by 40%', icon: '🎯' });

  const analytics = {
    workLifeBalance: Math.max(0, Math.min(100, 100 - (burnoutScore || 0))),
    focusEfficiency: focusHours && workHours ? Math.round((focusHours / workHours) * 100) : 0,
    meetingOverload: meetingHours > 20 ? 'High' : meetingHours > 10 ? 'Moderate' : 'Low',
  };

  res.json({ message, urgency, suggestions, analytics });
});

module.exports = router;
