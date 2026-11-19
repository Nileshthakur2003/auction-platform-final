# Online Auction Platform - Frontend Client

Modern, responsive React web client for the Online Auction Platform, built with **React 19**, **Vite**, **Socket.io Client**, and **Bootstrap 5**.

---

## 🚀 Features

- **Live Real-Time Bidding**: Powered by **Socket.io** client. Automatically synchronizes incoming bids, leading bidder status, and price changes without page reload.
- **Buyer & Seller Portals**: Dedicated sidebars, dashboards, and role-guarded routes (`ProtectedRoute`).
- **Interactive Bidding Console**: Instant + \$10 / + \$50 / + \$100 increments and countdown clocks.
- **Bidding History & Won Tracking**: Live badges for Won, Currently Leading, Outbid, and Lost statuses.
- **Toast Notifications**: Modern toast alerts via `react-hot-toast` replacing intrusive native alerts.
- **Centralized Session Context**: Clean `AuthContext` managing authentication tokens and session lifecycles.

---

## 🛠 Tech Stack

- **Framework**: React 19 + Vite
- **Routing**: React Router DOM v7
- **Real-Time**: Socket.io Client
- **UI Components**: React Bootstrap, Bootstrap 5, Emotion, Material-UI
- **Validation**: Zod
- **Notifications**: React Hot Toast
- **HTTP Client**: Axios with JWT Interceptors

---

## ⚙️ Setup & Installation

1. Install packages:
   ```bash
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   ```env
   VITE_API_URL=http://localhost:5001
   ```

3. Run in development:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```
