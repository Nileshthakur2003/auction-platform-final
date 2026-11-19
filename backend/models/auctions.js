const mongoose = require('mongoose');

const auctionItemSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    startingBid: {
      type: Number,
      required: true,
      min: 0,
    },
    currentBid: {
      type: Number,
      required: true,
      min: 0,
    },
    highestBidderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    highestBidId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bidding',
      default: null,
    },
    bidders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    closingTime: {
      type: Date,
      required: true,
    },
    openingTime: {
      type: Date,
      required: true,
    },
    isClosed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

auctionItemSchema.index({ closingTime: 1, isClosed: 1 });
auctionItemSchema.index({ sellerId: 1 });

const AuctionItem = mongoose.model('AuctionItem', auctionItemSchema);

module.exports = AuctionItem;
