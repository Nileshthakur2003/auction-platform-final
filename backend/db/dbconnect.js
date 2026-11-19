const mongoose = require('mongoose');
require('dotenv').config();

const mongoDB = process.env.MONGODB_URI || 'mongodb://localhost:27017/auctionDB';

mongoose.connect(mongoDB)
  .then(() => {
    console.log('Successfully connected to MongoDB!');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

const db = mongoose.connection;

module.exports = db;
