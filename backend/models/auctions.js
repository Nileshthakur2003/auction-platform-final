const mongoose = require('mongoose');

const auctionItemSchema = new mongoose.Schema({
  sellerId: { type:String , ref:'User'},
  itemName: String,
  description: String,
  currentBid: Number,
  highestBidderId: { type: String, ref: 'User' },
  bidders: [{type:String , ref:"User"}],
  closingTime: Date,
  openingTime: Date,
  isClosed: { type: Boolean, default: false },
});

const AuctionItem = mongoose.model('AuctionItem', auctionItemSchema);

module.exports = AuctionItem;
