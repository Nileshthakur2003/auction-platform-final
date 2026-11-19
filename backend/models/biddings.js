const mongoose = require('mongoose');

const biddingSchema = new mongoose.Schema(
  {
    auctionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AuctionItem',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    bidAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    // Supporting both spellings for backward compatibility with existing code
    successfullBid: {
      type: Boolean,
      default: false,
    },
    successfulBid: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'outbid', 'won', 'lost'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

biddingSchema.pre('save', function (next) {
  if (this.isModified('successfullBid')) {
    this.successfulBid = this.successfullBid;
  } else if (this.isModified('successfulBid')) {
    this.successfullBid = this.successfulBid;
  }
  next();
});

const Bidding = mongoose.model('Bidding', biddingSchema);

module.exports = Bidding;
