const connectDB = require('../db/dbconnect');
const app = require('../server');

// Serverless Handler for Vercel
module.exports = async (req, res) => {
  // Ensure MongoDB connection is initialized and reused
  await connectDB();

  // Forward request to Express app
  return app(req, res);
};
