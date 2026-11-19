# Online Auction Platform - Backend API

RESTful API and WebSocket server for the Online Auction Platform, built with **Node.js**, **Express**, **MongoDB/Mongoose**, and **Socket.io**.

---

## 🚀 Features

- **Real-Time Bidding**: Powered by **Socket.io** room broadcasts (`auction_<id>`).
- **Automated Settlement Worker**: Background cron (`node-cron`) automatically finalizes expired auctions and declares winning bids.
- **JWT Authentication & Role Control**: Distinct roles for Buyers and Sellers.
- **Shill-Bidding Prevention**: Sellers cannot bid on their own items.
- **Atomic Concurrency Handling**: High-concurrency safe bidding logic.
- **Centralized Error & Token Expiry Handling**: Clean responses without request hanging.

---

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-Time**: Socket.io
- **Security**: JSON Web Tokens (jsonwebtoken), bcryptjs
- **Scheduling**: node-cron

---

## ⚙️ Setup & Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` as needed:
   ```env
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/auctionDB
   JWT_SECRET=super_secret_auction_jwt_key_2025_ey_gds
   CLIENT_ORIGIN=http://localhost:5173
   NODE_ENV=development
   ```

3. Run smoke test:
   ```bash
   npm test
   ```

4. Start server:
   ```bash
   npm start
   ```

---

## 📡 API Endpoints

### Auth (`/`)
- `POST /signup` - User registration
- `POST /signin` - User login & token generation
- `GET /validate-token` - Token verification
- `GET /profile` - Logged-in user profile
- `POST /updateprofile` - Edit profile info

### Auctions (`/`)
- `POST /auction` - Create auction (Seller)
- `GET /auctions` - List all auctions
- `GET /auctions/:id` - Single auction details
- `GET /getauction/:id` - Detailed auction with populated bids
- `GET /getAuctionsForSeller` - Auctions posted by seller
- `GET /getauctionresult/:id` - Settlement outcome
- `PUT /auction/:id` - Edit auction (Owner only)
- `GET /getearnings` - Seller revenue records
- `GET /getstats` - Seller analytics

### Bids (`/`)
- `POST /bid/:id` - Place a bid (broadcasts via WebSockets)
- `GET /getauctionbidded` - Active auctions bid on
- `GET /getBidsForUser` - Complete user bidding history
- `GET /getTotalSpentByUser` - Total spent on won auctions
