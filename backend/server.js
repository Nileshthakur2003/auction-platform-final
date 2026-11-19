const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

// Database Connection
require('./db/dbconnect');

// Models
const AuctionItem = require('./models/auctions');
const Bidding = require('./models/biddings');

// Route Handlers
const authRoutes = require('./routes/auth');
const auctionRoutes = require('./routes/auctions');
const bidRoutes = require('./routes/bids');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT'],
  },
});

app.set('io', io);

// Socket.io Connection Logic
io.on('connection', (socket) => {
  // Join a specific auction room for live updates
  socket.on('join_auction', (auctionId) => {
    if (auctionId) {
      socket.join(`auction_${auctionId}`);
    }
  });

  // Leave auction room
  socket.on('leave_auction', (auctionId) => {
    if (auctionId) {
      socket.leave(`auction_${auctionId}`);
    }
  });

  socket.on('disconnect', () => {
    // Client disconnected
  });
});

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', uptime: process.uptime(), timestamp: new Date() });
});

// Mount Routes (Mounting on root preserves 100% backward compatibility with frontend endpoints)
app.use('/', authRoutes);
app.use('/', auctionRoutes);
app.use('/', bidRoutes);

// Also mount under /api prefix for standard REST convention
app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/bids', bidRoutes);

// Cron Job: Evaluates expired auctions every 30 seconds
// (Replaced the wasteful every-1-second poll '* * * * * *' with a reliable 30-second interval)
cron.schedule('*/30 * * * * *', async () => {
  try {
    const now = new Date();

    // Find all expired auctions that are still marked open
    const expiredAuctions = await AuctionItem.find({
      closingTime: { $lte: now },
      isClosed: false,
    });

    if (expiredAuctions.length === 0) return;

    console.log(`[Cron] Found ${expiredAuctions.length} expired auction(s) to finalize.`);

    for (const auction of expiredAuctions) {
      // Find the highest bid placed for this auction
      const highestBid = await Bidding.findOne({ auctionId: auction._id }).sort({
        bidAmount: -1,
      });

      if (highestBid) {
        // Mark winning bid
        highestBid.successfullBid = true;
        highestBid.successfulBid = true;
        highestBid.status = 'won';
        await highestBid.save();

        // Mark remaining bids as lost
        await Bidding.updateMany(
          { auctionId: auction._id, _id: { $ne: highestBid._id } },
          { $set: { status: 'lost', successfullBid: false, successfulBid: false } }
        );

        auction.highestBidderId = highestBid.userId;
        auction.highestBidId = highestBid._id;
      }

      auction.isClosed = true;
      await auction.save();

      // Real-time broadcast that auction closed
      io.to(`auction_${auction._id}`).emit('auction_closed', {
        auctionId: auction._id,
        isClosed: true,
        winnerId: auction.highestBidderId,
        finalBid: auction.currentBid,
      });
      io.emit('auction_feed_update', {
        auctionId: auction._id,
        isClosed: true,
      });

      console.log(`[Cron] Auction "${auction.itemName}" (${auction._id}) closed successfully.`);
    }
  } catch (err) {
    console.error('[Cron] Error finalizing auction items:', err);
  }
});

// Centralized 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ message: 'Internal Server Error', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

// Start Server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io enabled and listening for real-time bids`);
});

module.exports = { app, server };
