// Local development server. On Vercel the same app runs from api/index.js.
const app = require('./app');
const connectDB = require('./db/connect');

const PORT = process.env.PORT || 3000;
connectDB()
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB error:', err.message));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
