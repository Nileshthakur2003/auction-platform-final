// // Importing necessary modules
// const mongoose = require('mongoose');
// require('dotenv').config(); // Load environment variables from .env file

// // MongoDB connection URL from environment variables
// const mongoDB = process.env.MONGODB_URI;

// // Connect to MongoDB
// mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

// // Get the default connection
// const db = mongoose.connection;

// // Bind connection to error event (to get notification of connection errors)
// db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// // Bind connection to success event
// db.once('open', () => {
//   console.log('Successfully connected to MongoDB!');
// });

// module.exports = db;
