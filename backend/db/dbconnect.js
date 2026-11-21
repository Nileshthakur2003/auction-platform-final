const mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config();

// Fix for Node.js querySrv ECONNREFUSED on Windows and certain local network DNS resolvers
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // In some environments, setServers may not be permitted
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auctionDB';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * and serverless function cold starts in Vercel.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log('Connected to MongoDB successfully');
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;

    if (e.message && e.message.includes('authentication failed')) {
      console.error('MongoDB Authentication Failed: Please check your MongoDB username & password in backend/.env');
    } else if (e.code === 'ECONNREFUSED' || (e.message && e.message.includes('ECONNREFUSED'))) {
      console.error('MongoDB DNS/Network Error: Could not resolve cluster SRV record. Verify internet connectivity.');
    } else {
      console.error('MongoDB Connection Error:', e.message || e);
    }
    throw e;
  }

  return cached.conn;
}

module.exports = connectDB;
