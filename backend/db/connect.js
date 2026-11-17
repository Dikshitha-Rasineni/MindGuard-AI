const mongoose = require('mongoose');

// Reuse one connection across serverless invocations (Vercel keeps the module warm between requests).
let cached = global.__mindguardMongo || (global.__mindguardMongo = { conn: null, promise: null });

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not set');
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 })
      .then(m => m)
      .catch(err => { cached.promise = null; throw err; });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
