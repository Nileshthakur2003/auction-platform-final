const express = require('express');
const router = express.Router();
const AuctionItem = require('../models/auctions');
const Bidding = require('../models/biddings');
const { authenticate } = require('../middleware/auth');

// Place a Bid on an Auction (Protected)
router.post('/bid/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { bid } = req.body;

    const numericBid = parseFloat(bid);
    if (isNaN(numericBid) || numericBid <= 0) {
      return res.status(400).json({ message: 'Bid must be a valid positive number' });
    }

    const item = await AuctionItem.findById(id);
    if (!item) {
      return res.status(404).json({ message: 'Auction item not found' });
    }

    if (item.isClosed) {
      return res.status(400).json({ message: 'Auction is closed' });
    }

    const now = new Date();

    // Check opening time
    if (now < new Date(item.openingTime)) {
      return res.status(400).json({ message: 'Auction has not started yet' });
    }

    // Check closing time
    if (now >= new Date(item.closingTime)) {
      item.isClosed = true;
      await item.save();
      return res.status(400).json({ message: 'Auction closing time has passed. Auction is now closed.' });
    }

    // Anti-Shill Bidding: Sellers cannot bid on their own auctions
    if (item.sellerId && item.sellerId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Sellers are not permitted to bid on their own auctions' });
    }

    // Ensure bid is strictly higher than current bid
    if (numericBid <= item.currentBid) {
      return res.status(400).json({
        message: `Bid too low! Your bid must be higher than the current bid of $${item.currentBid}`,
      });
    }

    // Create bid record
    const newBidItem = new Bidding({
      auctionId: item._id,
      userId: req.user._id,
      bidAmount: numericBid,
      successfullBid: false,
      successfulBid: false,
      status: 'active',
    });

    await newBidItem.save();

    // Mark previous bids on this auction as outbid
    await Bidding.updateMany(
      { auctionId: item._id, _id: { $ne: newBidItem._id } },
      { $set: { status: 'outbid' } }
    );

    // Update auction current bid and highest bidder
    item.currentBid = numericBid;
    item.highestBidderId = req.user._id;
    item.highestBidId = newBidItem._id;

    const userAlreadyBidded = item.bidders.some(
      (bidderId) => bidderId.toString() === req.user._id.toString()
    );
    if (!userAlreadyBidded) {
      item.bidders.push(req.user._id);
    }

    await item.save();

    // Real-Time Socket.io Broadcast
    const io = req.app.get('io');
    if (io) {
      const livePayload = {
        auctionId: item._id.toString(),
        currentBid: numericBid,
        highestBidder: req.user.username,
        highestBidderId: req.user._id,
        biddersCount: item.bidders.length,
        newBid: {
          _id: newBidItem._id,
          auctionId: item._id,
          bidAmount: numericBid,
          createdAt: newBidItem.createdAt,
          successfullBid: false,
          successfulBid: false,
          bidderUsername: req.user.username,
        },
      };

      // Broadcast to users in the auction-specific room
      io.to(`auction_${item._id}`).emit('bid_updated', livePayload);

      // Broadcast global price update to live auction list
      io.emit('auction_feed_update', livePayload);
    }

    return res.status(200).json({ message: 'Bid successful', item });
  } catch (error) {
    console.error('Bidding Error:', error);
    if (!res.headersSent) {
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
});

// Get active auctions user has placed bids on
router.get('/getauctionbidded', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const distinctAuctionIds = await Bidding.distinct('auctionId', { userId: userId });

    const auctions = await AuctionItem.find({
      _id: { $in: distinctAuctionIds },
      closingTime: { $gt: new Date() },
      isClosed: false,
    });

    return res.status(200).json(auctions);
  } catch (error) {
    console.error('Fetching bidded auctions error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get all bids placed by the logged-in user
router.get('/getBidsForUser', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch bids and populate auction details in a single query (No N+1)
    const bids = await Bidding.find({ userId: userId })
      .populate('auctionId', 'itemName currentBid isClosed closingTime')
      .sort({ createdAt: -1 });

    const bidsData = bids.map((b) => {
      const isWon = b.successfullBid || b.successfulBid || false;
      let displayStatus = 'In Progress';
      if (b.auctionId?.isClosed) {
        displayStatus = isWon ? 'Won' : 'Lost';
      } else if (b.status === 'outbid') {
        displayStatus = 'Outbid';
      } else {
        displayStatus = 'Winning';
      }

      return {
        bidId: b._id,
        auctionId: b.auctionId ? b.auctionId._id : null,
        auctionName: b.auctionId ? b.auctionId.itemName : 'Auction Item',
        bidAmount: b.bidAmount,
        createdAt: b.createdAt,
        successfullBid: isWon,
        successfulBid: isWon,
        status: displayStatus,
        isClosed: b.auctionId ? b.auctionId.isClosed : true,
      };
    });

    return res.status(200).json(bidsData);
  } catch (error) {
    console.error('Fetching user bids error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get total amount spent by user on winning bids
router.get('/getTotalSpentByUser', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;

    const winningBids = await Bidding.find({
      userId: userId,
      $or: [{ successfullBid: true }, { successfulBid: true }],
    });

    const totalSpent = winningBids.reduce((sum, b) => sum + (b.bidAmount || 0), 0);

    return res.status(200).json({
      bids: winningBids,
      totalSpent: totalSpent,
    });
  } catch (error) {
    console.error('Fetching total spent error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
