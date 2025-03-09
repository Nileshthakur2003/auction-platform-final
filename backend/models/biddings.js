const mongoose = require('mongoose');

const biddingSchema = new mongoose.Schema({
  auctionId: { type: mongoose.Schema.Types.ObjectId, ref: 'AuctionItem', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  bidAmount:{ type: Number, required:true },
  successfullBid: { type: Boolean, default: false },
});

const Bidding = mongoose.model('Bidding', biddingSchema);

module.exports = Bidding;
