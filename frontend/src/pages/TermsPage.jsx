import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, Gavel, ShieldCheck, AlertTriangle, FileText, Globe, ArrowLeft, CheckCircle2 } from 'lucide-react';

const TermsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 p-4 sm:p-8 lg:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-white transition mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go back</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Auction Terms & Legal Conditions
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Statutory Auction Guidelines for India, the United States, and International Jurisdictions
              </p>
            </div>
          </div>
        </div>

        {/* Minimalist Key Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Gavel className="w-4 h-4" />
              <span>Irrevocable Bidding</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every bid placed is an unconditional, legally binding contractual offer. Upon timer expiry (the electronic equivalent of the fall of the hammer), the highest verified bid constitutes an enforceable contract of sale.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>As-Is, Where-Is Basis</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              All auction lots are offered "as-is, where-is", with all faults and defects, without implied warranties of merchantability or fitness for a particular purpose beyond declarations explicitly published by the seller.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Strict Anti-Shill Policy</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Consignors and sellers are prohibited from placing bids on their own listings directly or through proxies. Violations void the sale and lead to permanent account revocation under applicable commercial fraud statutes.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <FileText className="w-4 h-4" />
              <span>Title & Ownership Deed</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Title, risk of loss, and right of possession pass to the high bidder upon verified financial settlement. Every completed auction generates an official, tamper-evident Bill of Sale & Tax Receipt.
            </p>
          </div>
        </div>

        {/* Detailed Statutory Mandates */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-6 mb-8 text-xs sm:text-sm text-slate-300">
          <div>
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <span>🇮🇳 Indian Law Compliance (Sale of Goods Act 1930 § 64)</span>
            </h3>
            <p className="text-slate-400 leading-relaxed text-xs">
              Auctions conducted in India are governed by <strong>Section 64 of The Sale of Goods Act, 1930</strong> (Sale by Auction), the <strong>Indian Contract Act, 1872</strong>, and the <strong>Information Technology Act, 2000</strong>. Each lot constitutes a separate contract of sale. Platform facilitation charges and commission levies are subject to <strong>18% GST (CGST 9% + SGST 9% / IGST 18%)</strong> under the Central Goods and Services Tax Act, 2017.
            </p>
          </div>

          <div className="border-t border-slate-800/80 pt-4">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <span>🇺🇸 United States Law Compliance (UCC § 2-328)</span>
            </h3>
            <p className="text-slate-400 leading-relaxed text-xs">
              Auctions governed under US jurisdiction comply with <strong>Uniform Commercial Code (UCC) § 2-328 (Sale by Auction)</strong>. Sales are concluded upon electronic hammer fall. Warranties are disclaimed pursuant to <strong>UCC § 2-316</strong>. Destination state and municipal sales taxes apply according to applicable economic nexus thresholds.
            </p>
          </div>

          <div className="border-t border-slate-800/80 pt-4">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <span>🌐 International Trade & Commercial Arbitration</span>
            </h3>
            <p className="text-slate-400 leading-relaxed text-xs">
              For cross-border international sales, parties submit to the <strong>UNCITRAL Model Law on Electronic Commerce (1996)</strong>, and all disputes arising out of or in connection with the auction contract shall be resolved in accordance with standard rules of the <strong>International Chamber of Commerce (ICC)</strong>.
            </p>
          </div>
        </div>

        {/* Bottom Callout */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Digital Deeds and Bills of Sale are automatically generated upon auction conclusion.</span>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
