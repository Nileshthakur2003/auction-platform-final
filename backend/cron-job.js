// Optional standalone runner for auction finalization worker
const cron = require('node-cron');
const db = require('./db/dbconnect');
const AuctionItem = require('./models/auctions');
const Bidding = require('./models/biddings');

const finalizeExpiredAuctions = async () => {
  try {
    const now = new Date();
    const expiredAuctions = await AuctionItem.find({
      closingTime: { $lte: now },
      isClosed: false,
    });

    for (const auction of expiredAuctions) {
      const highestBid = await Bidding.findOne({ auctionId: auction._id }).sort({ bidAmount: -1 });
      if (highestBid) {
        highestBid.successfullBid = true;
        highestBid.successfulBid = true;
        highestBid.status = 'won';
        await highestBid.save();

        await Bidding.updateMany(
          { auctionId: auction._id, _id: { $ne: highestBid._id } },
          { $set: { status: 'lost', successfullBid: false, successfulBid: false } }
        );
        auction.highestBidderId = highestBid.userId;
        auction.highestBidId = highestBid._id;
      }
      auction.isClosed = true;
      await auction.save();
    }
  } catch (error) {
    console.error('Worker error:', error);
  }
};

cron.schedule('*/30 * * * * *', finalizeExpiredAuctions);

module.exports = finalizeExpiredAuctions;
