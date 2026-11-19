const AuctionItem = require('./models/auctions');
const Bidding = require('./models/biddings');

/**
 * Evaluates and finalizes expired auctions.
 * Works both as a Vercel Serverless Cron Handler and a local node-cron job.
 */
const finalizeExpiredAuctions = async (io = null) => {
  try {
    const now = new Date();

    const expiredAuctions = await AuctionItem.find({
      closingTime: { $lte: now },
      isClosed: false,
    });

    if (expiredAuctions.length === 0) {
      return { finalizedCount: 0, message: 'No auctions to finalize' };
    }

    let finalizedCount = 0;

    for (const auction of expiredAuctions) {
      const highestBid = await Bidding.findOne({ auctionId: auction._id }).sort({
        bidAmount: -1,
      });

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
      finalizedCount++;

      if (io) {
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
      }
    }

    return {
      finalizedCount,
      message: `Successfully finalized ${finalizedCount} auction(s).`,
    };
  } catch (error) {
    console.error('Error during auction finalization:', error);
    throw error;
  }
};

module.exports = finalizeExpiredAuctions;
