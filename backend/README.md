# Online Auction Platform - Serverless Backend (Vercel Ready)

RESTful API and Serverless Function backend for the Online Auction Platform, designed to run seamlessly on **Vercel Serverless Functions** and locally on **Node.js**.

---

## ⚡ Serverless Architecture on Vercel

1. **Serverless Function Entry (`api/index.js`)**:
   - Vercel routes all API requests through `api/index.js` via `vercel.json` rewrites.
2. **Global Cached Mongoose Connection**:
   - Implements the official serverless connection caching pattern to prevent connection pool exhaustion during function re-invocations and cold starts.
3. **Automated Auction Settlement via Vercel Cron**:
   - Instead of a persistent daemon, Vercel triggers `/api/cron` every minute via `vercel.json` to close expired auctions and record winning bids automatically.
4. **Dual-Mode Capability**:
   - **On Vercel**: Runs 100% serverlessly.
   - **Locally**: Runs as a standard Express + Socket.io server with `npm start`.

---

## 🚀 Deploying to Vercel

### Method 1: Using the Vercel Web Dashboard (Recommended)

1. Push your backend repository to GitHub.
2. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Select your backend repository.
4. In **Environment Variables**, add:
   - `MONGODB_URI`: Your MongoDB Atlas connection string (e.g., `mongodb+srv://<user>:<password>@cluster.mongodb.net/auctionDB?retryWrites=true&w=majority`)
   - `JWT_SECRET`: A secure random string for JWT signing
   - `CLIENT_ORIGIN`: Your frontend URL (e.g. `https://your-frontend.vercel.app` or `*`)
   - `NODE_ENV`: `production`
5. Click **Deploy**.

---

### Method 2: Using the Vercel CLI

```bash
# 1. Install Vercel CLI (if not already installed)
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
cd backend
vercel --prod
```

---

## 💻 Local Development

```bash
cd backend
npm install
npm run dev
```
*Server will start on `http://localhost:5001` with local Socket.io enabled.*

---

## 📡 Key Endpoints

- `GET /health` or `GET /api/health` - Serverless status & uptime
- `GET /api/cron` - Vercel Cron trigger for auction finalization
- `POST /signin` & `POST /signup` - Authentication
- `POST /auction` & `GET /auctions` - Auction listings
- `POST /bid/:id` - Concurrency-safe bidding
