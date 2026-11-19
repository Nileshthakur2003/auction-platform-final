const express = require('express');
const router = express.Router();
const AuctionItem = require('../models/auctions');
const User = require('../models/users');
const Bidding = require('../models/biddings');
const { authenticate } = require('../middleware/auth');

// Create Auction Item (Protected)
router.post('/auction', authenticate, async (req, res) => {
  try {
    const { itemName, description, startingBid, closingTime, openingTime } = req.body;

    if (!itemName || !description || startingBid === undefined || !closingTime || !openingTime) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const start = new Date(openingTime);
    const end = new Date(closingTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid opening or closing date' });
    }

    if (end <= start) {
      return res.status(400).json({ message: 'Closing time must be after opening time' });
    }

    const parsedStartingBid = parseFloat(startingBid);
    if (isNaN(parsedStartingBid) || parsedStartingBid <= 0) {
      return res.status(400).json({ message: 'Starting bid must be a positive number' });
    }

    const newItem = new AuctionItem({
      itemName: itemName.trim(),
      description: description.trim(),
      startingBid: parsedStartingBid,
      currentBid: parsedStartingBid,
      closingTime: end,
      openingTime: start,
      sellerId: req.user._id,
      bidders: [],
      isClosed: false,
    });

    await newItem.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('auction_created', newItem);
    }

    return res.status(201).json({ message: 'Auction item created', item: newItem });
  } catch (error) {
    console.error('Auction Post Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get all auction items
router.get('/auctions', async (req, res) => {
  try {
    const auctions = await AuctionItem.find().sort({ createdAt: -1 });
    return res.status(200).json(auctions);
  } catch (error) {
    console.error('Fetching Auctions Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get auctions posted by logged-in seller
router.get('/getAuctionsForSeller', authenticate, async (req, res) => {
  try {
    const auctions = await AuctionItem.find({ sellerId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json(auctions);
  } catch (error) {
    console.error('Fetching Auctions Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get a single auction item by ID
router.get('/auctions/:id', async (req, res) => {
  try {
    const auctionItem = await AuctionItem.findById(req.params.id);
    if (!auctionItem) {
      return res.status(404).json({ message: 'Auction not found' });
    }
    return res.status(200).json(auctionItem);
  } catch (error) {
    console.error('Fetching Auction Item Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get auction details with bids for viewer
router.get('/getauction/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const auction = await AuctionItem.findById(id);

    if (!auction) {
      return res.status(404).json({ message: 'Auction item not found' });
    }

    const isSeller = auction.sellerId && auction.sellerId.toString() === req.user._id.toString();

    // Fetch bids and populate username in ONE query (No N+1!)
    const bids = await Bidding.find({ auctionId: id })
      .populate('userId', 'username email')
      .sort({ bidAmount: -1 });

    const refinedBids = bids.map((b) => ({
      _id: b._id,
      auctionId: b.auctionId,
      bidAmount: b.bidAmount,
      createdAt: b.createdAt,
      successfullBid: b.successfullBid || b.successfulBid || false,
      successfulBid: b.successfulBid || b.successfullBid || false,
      bidderUsername: b.userId ? b.userId.username : 'Unknown Bidder',
    }));

    const seller = await User.findById(auction.sellerId).select('username');

    const auctionData = {
      _id: auction._id,
      seller: seller ? seller.username : 'Unknown',
      sellerId: auction.sellerId,
      itemName: auction.itemName,
      description: auction.description,
      startingBid: auction.startingBid,
      currentBid: auction.currentBid,
      bidders: auction.bidders || [],
      closingTime: auction.closingTime,
      openingTime: auction.openingTime,
      isClosed: auction.isClosed,
      editable: isSeller,
      bids: refinedBids,
    };

    return res.status(200).json(auctionData);
  } catch (error) {
    console.error('Fetching Auction Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get auction result
router.get('/getauctionresult/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const auction = await AuctionItem.findById(id);

    if (!auction) {
      return res.status(404).json({ message: 'Auction item not found' });
    }

    const bids = await Bidding.find({ auctionId: id })
      .populate('userId', 'username')
      .sort({ bidAmount: -1 });

    let highestBidderUsername = 'No Bids Placed';
    if (auction.highestBidderId) {
      const highestBidderRecord = await User.findById(auction.highestBidderId).select('username');
      if (highestBidderRecord) {
        highestBidderUsername = highestBidderRecord.username;
      }
    }

    const auctionData = {
      auctionId: auction._id,
      itemName: auction.itemName,
      description: auction.description,
      currentBid: auction.currentBid,
      startingBid: auction.startingBid,
      bidders: auction.bidders || [],
      closingTime: auction.closingTime,
      openingTime: auction.openingTime,
      isClosed: auction.isClosed,
      highestBidder: highestBidderUsername,
      bids: bids,
    };

    return res.status(200).json(auctionData);
  } catch (error) {
    console.error('Fetching Auction Result Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Edit Auction Item (Protected - Seller Authorization Checked)
router.put('/auction/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { itemName, description, closingTime, openingTime } = req.body;

    const auctionItem = await AuctionItem.findById(id);
    if (!auctionItem) {
      return res.status(404).json({ message: 'Auction item not found' });
    }

    // Security Check: Only the auction owner can edit
    if (auctionItem.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized: You can only edit your own auctions' });
    }

    // Do not allow editing closed auctions
    if (auctionItem.isClosed) {
      return res.status(400).json({ message: 'Cannot edit a closed auction' });
    }

    if (itemName) auctionItem.itemName = itemName.trim();
    if (description) auctionItem.description = description.trim();
    if (openingTime) auctionItem.openingTime = new Date(openingTime);
    if (closingTime) auctionItem.closingTime = new Date(closingTime);

    // Note: We deliberately IGNORE any attempts to alter currentBid or highestBidder via PUT!

    await auctionItem.save();
    return res.status(200).json({ message: 'Auction item updated', item: auctionItem });
  } catch (error) {
    console.error('Auction Edit Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get seller earnings
router.get('/getearnings', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;

    // Only count closed auctions that had an actual winning bidder
    const closedAuctions = await AuctionItem.find({
      sellerId: userId,
      isClosed: true,
      highestBidderId: { $ne: null },
    });

    const earningRecords = closedAuctions.map((item) => ({
      itemName: item.itemName,
      finalBid: item.currentBid,
      closingTime: item.closingTime,
      openingTime: item.openingTime,
    }));

    return res.status(200).json(earningRecords);
  } catch (error) {
    console.error('Fetching Earnings Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get seller stats (Aggregated in 1 step without N+1 queries)
router.get('/getstats', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;

    const [allSellerAuctions, closedSoldAuctions] = await Promise.all([
      AuctionItem.find({ sellerId: userId }),
      AuctionItem.find({ sellerId: userId, isClosed: true, highestBidderId: { $ne: null } }),
    ]);

    const auctionIds = allSellerAuctions.map((a) => a._id);
    const totalBidsReceived = await Bidding.countDocuments({ auctionId: { $in: auctionIds } });

    const totalEarnings = closedSoldAuctions.reduce((sum, item) => sum + (item.currentBid || 0), 0);

    const earningStats = {
      bidsReceived: totalBidsReceived,
      auctionedItems: allSellerAuctions.length,
      totalEarnings: totalEarnings,
    };

    return res.status(200).json(earningStats);
  } catch (error) {
    console.error('Fetching Stats Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
