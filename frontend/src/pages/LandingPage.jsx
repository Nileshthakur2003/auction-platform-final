import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spotlight from '../components/ui/Spotlight';
import BackgroundBeams from '../components/ui/BackgroundBeams';
import HoverBorderGradient from '../components/ui/HoverBorderGradient';
import CardSpotlight from '../components/ui/CardSpotlight';
import { BentoGrid, BentoGridItem } from '../components/ui/BentoGrid';
import { Zap, ShieldCheck, TrendingUp, Gavel, Users, Bell } from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated, userType } = useAuth();
  const dashboardPath = userType === '1' ? '/seller' : '/buyer';

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-slate-100 overflow-hidden flex flex-col justify-between">
      {/* Aceternity UI Spotlight Effects */}
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#3b82f6" />
      <Spotlight className="top-20 right-0 md:right-40" fill="#a855f7" />

      {/* Atmospheric Background Beams & Grids */}
      <BackgroundBeams />

      {/* Hero Section */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-medium mb-8 backdrop-blur-md">
          <Zap className="w-4 h-4 text-blue-400 animate-pulse" />
          <span>Real-Time WebSocket Bidding Engine 2.0</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500 max-w-4xl mx-auto leading-tight mb-6">
          The Next-Gen Live <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
            Auction Platform
          </span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Discover rare collectibles, electronics, and valuable items. Place instantaneous bids
          with sub-millisecond WebSocket synchronization.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          {isAuthenticated ? (
            <Link to={dashboardPath}>
              <HoverBorderGradient
                containerClassName="rounded-full"
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3.5 text-lg"
              >
                Go to Dashboard &rarr;
              </HoverBorderGradient>
            </Link>
          ) : (
            <>
              <Link to="/signin">
                <HoverBorderGradient
                  containerClassName="rounded-full"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3.5 text-base"
                >
                  Sign In to Bid
                </HoverBorderGradient>
              </Link>
              <Link to="/signup">
                <button className="px-8 py-3.5 rounded-full border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-semibold text-base transition-all duration-200 backdrop-blur-md hover:border-slate-600">
                  Create Free Account
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Bento Grid Feature Showcase */}
        <div className="text-left mt-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-2">Engineered for High-Stakes Auctions</h2>
            <p className="text-slate-400">High concurrency, role security, and real-time live settlement.</p>
          </div>

          <BentoGrid className="max-w-5xl mx-auto">
            <BentoGridItem
              title="Real-Time Bid Streaming"
              description="Powered by Socket.io room broadcasts. See prices and leading bidder updates the exact millisecond they happen."
              header={
                <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-blue-950/40 to-indigo-950/40 border border-blue-900/30 p-4 items-center justify-center">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="text-emerald-400 font-mono font-bold">$1,450.00 Leading Bid</span>
                  </div>
                </div>
              }
              icon={<Zap className="h-6 w-6 text-blue-400" />}
              className="md:col-span-2"
            />

            <BentoGridItem
              title="Shill-Bidding Protection"
              description="Server-enforced role verification prevents sellers from bidding on their own listings to inflate prices."
              header={
                <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-purple-950/40 to-slate-900 border border-purple-900/30 p-4 items-center justify-center">
                  <ShieldCheck className="w-12 h-12 text-purple-400/80" />
                </div>
              }
              icon={<ShieldCheck className="h-6 w-6 text-purple-400" />}
              className="md:col-span-1"
            />

            <BentoGridItem
              title="Automated Settlement"
              description="Background workers evaluate expired auctions, declare winners, and log verified earnings automatically."
              header={
                <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-slate-800 p-4 items-center justify-center">
                  <Gavel className="w-12 h-12 text-indigo-400/80" />
                </div>
              }
              icon={<Gavel className="h-6 w-6 text-indigo-400" />}
              className="md:col-span-1"
            />

            <BentoGridItem
              title="Seller Revenue & Live Analytics"
              description="Realized gross revenue tracking, active bid counts, and detailed transaction ledgers for verified sellers."
              header={
                <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-emerald-950/30 to-blue-950/40 border border-emerald-900/30 p-4 items-center justify-center">
                  <TrendingUp className="w-12 h-12 text-emerald-400/80" />
                </div>
              }
              icon={<TrendingUp className="h-6 w-6 text-emerald-400" />}
              className="md:col-span-2"
            />
          </BentoGrid>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 py-8 px-6 text-center text-slate-500 text-sm">
        <p className="mb-0">© 2026 Online Auction Platform. Built with Aceternity UI, React 19 & Socket.io.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
