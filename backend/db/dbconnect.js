// Importing mongoose
const mongoose = require('mongoose');


// MongoDB connection URL (replace with your own)
const mongoDB = 'mongodb://localhost:27017/auctionDB';

// Connect to MongoDB
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

// Get the default connection
const db = mongoose.connection;


// Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Bind connection to success event
db.once('open', () => {
  console.log('Successfully connected to MongoDB!');
});

module.exports = db;
