const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

// Cached Database Connection
const connectDB = require('./db/dbconnect');

// Scheduled Worker
const finalizeExpiredAuctions = require('./cron-job');

// Route Handlers
const authRoutes = require('./routes/auth');
const auctionRoutes = require('./routes/auctions');
const bidRoutes = require('./routes/bids');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5001;

// Setup Socket.io for local / stateful environments
let io = null;
if (!process.env.VERCEL) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT'],
    },
  });

  io.on('connection', (socket) => {
    socket.on('join_auction', (auctionId) => {
      if (auctionId) {
        socket.join(`auction_${auctionId}`);
      }
    });

    socket.on('leave_auction', (auctionId) => {
      if (auctionId) {
        socket.leave(`auction_${auctionId}`);
      }
    });
  });

  app.set('io', io);
}

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

// Database connection middleware for serverless requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection error in request:', error);
    res.status(500).json({ message: 'Database connection failed' });
  }
});

// Health Check
app.get(['/', '/health', '/api/health'], (req, res) => {
  res.status(200).json({
    status: 'OK',
    serverless: !!process.env.VERCEL,
    timestamp: new Date().toISOString(),
  });
});

// Vercel Serverless Cron Endpoint
// Vercel Cron sends a GET request to /api/cron or /cron on a recurring schedule
app.get(['/cron', '/api/cron'], async (req, res) => {
  try {
    const result = await finalizeExpiredAuctions(io);
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error) {
    console.error('Vercel Cron Execution Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Mount Routes (Mounting on root & /api ensures full compatibility across Vercel & local endpoints)
app.use('/', authRoutes);
app.use('/', auctionRoutes);
app.use('/', bidRoutes);

app.use('/api', authRoutes);
app.use('/api', auctionRoutes);
app.use('/api', bidRoutes);

// Local Cron Job: Runs when NOT in Vercel serverless mode
if (!process.env.VERCEL) {
  cron.schedule('*/30 * * * * *', async () => {
    try {
      await finalizeExpiredAuctions(io);
    } catch (err) {
      // Avoid flooding the console with stack traces
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Local Cron] Auction finalization skipped:', err.message);
      }
    }
  });
}

// Centralized 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start listening if running directly as main entry (Local Development)
if (!process.env.VERCEL && require.main === module) {
  // Connect to database on server boot
  connectDB().catch((err) => {
    console.warn('[Server Boot] Initial MongoDB connection not ready. Will retry on request.');
  });

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Local Socket.io enabled and listening for real-time bids`);
  });
}

module.exports = app;
