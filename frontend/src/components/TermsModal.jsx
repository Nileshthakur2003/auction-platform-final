import React, { useState } from 'react';
import { Gavel, ShieldCheck, Scale, FileText, CheckCircle2, X, AlertTriangle, Globe } from 'lucide-react';

const TermsModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'jurisdiction' | 'full'

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Auction Legal Terms</h3>
              <p className="text-xs text-slate-400">Minimalist & Statutory Framework (India, USA & Global)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Terms"
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/40 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('summary')}
            className={`py-3 px-4 border-b-2 transition cursor-pointer ${
              activeTab === 'summary'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Essential Principles
          </button>
          <button
            onClick={() => setActiveTab('jurisdiction')}
            className={`py-3 px-4 border-b-2 transition cursor-pointer ${
              activeTab === 'jurisdiction'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Jurisdiction & Laws (IN / US / Global)
          </button>
          <button
            onClick={() => setActiveTab('full')}
            className={`py-3 px-4 border-b-2 transition cursor-pointer ${
              activeTab === 'full'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Full Legal Clauses
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs sm:text-sm text-slate-300">
          {activeTab === 'summary' && (
            <div className="space-y-3.5">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Gavel className="w-4 h-4" />
                  <span>1. Irrevocable & Binding Bids</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Every submitted bid constitutes a legally binding purchase offer. Upon expiration of the auction clock (the electronic equivalent of the fall of the hammer), the highest verified bidder enters into an enforceable contract of sale.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <span>2. As-Is, Where-Is Basis</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  All auction lots are offered "as-is, where-is", with all faults and defects, without implied warranties of merchantability or fitness for a particular purpose beyond declarations explicitly published by the seller.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>3. Zero Shill-Bidding & Anti-Collusion</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Sellers are strictly barred from bidding on their own lots directly or through surrogates, sock puppets, or automated scripts. Violations void the auction and result in permanent ban and potential statutory reporting.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                  <FileText className="w-4 h-4" />
                  <span>4. Title & Risk of Loss Transfer</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Title and ownership deed pass to the winning buyer upon confirmed settlement of the hammer price and applicable platform levies. Risk of loss transfers concurrently upon release of possession.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                  <Globe className="w-4 h-4" />
                  <span>5. Statutory Taxes & Duties</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  The buyer is responsible for all applicable regional taxes, duties, and statutory levies (e.g. GST in India, state and local sales taxes in the United States, or VAT internationally).
                </p>
              </div>
            </div>
          )}

          {activeTab === 'jurisdiction' && (
            <div className="space-y-4">
              {/* India */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <span className="text-base">🇮🇳</span>
                    <span>India Statutory Compliance</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    SOGA 1930 & IT Act 2000
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Governed under <strong>Section 64 of The Sale of Goods Act, 1930</strong> (Sale by Auction) and the <strong>Indian Contract Act, 1872</strong>. Electronic bids constitute valid digital agreements under the <strong>Information Technology Act, 2000</strong>. Platform transactions are subject to <strong>CGST & SGST (18%)</strong> under the Central Goods and Services Tax Act, 2017.
                </p>
              </div>

              {/* USA */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <span className="text-base">🇺🇸</span>
                    <span>United States Compliance</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                    UCC § 2-328 & State Law
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Compliant with <strong>Uniform Commercial Code (UCC) § 2-328 (Sale by Auction)</strong>. Each lot constitutes a separate sale. Auction completion is effective upon clock expiration (equivalent to the fall of the hammer). All warranties are disclaimed pursuant to <strong>UCC § 2-316</strong> ("As Is"). Applicable state sales taxes apply based on destination nexus.
                </p>
              </div>

              {/* Global */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <span className="text-base">🌐</span>
                    <span>International Commercial Arbitration</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                    UNCITRAL & ICC Rules
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  For cross-border commercial transactions, parties consent to UNCITRAL Model Law on Electronic Commerce (1996) and dispute resolution governed by standard International Chamber of Commerce (ICC) arbitration principles.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'full' && (
            <div className="space-y-4 text-xs text-slate-400 leading-relaxed font-mono bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 max-h-80 overflow-y-auto">
              <p className="text-slate-200 font-bold uppercase text-[11px]">
                AUCTIONEERING TERMS OF SERVICE & DEED OF AGREEMENT
              </p>
              <p>
                1. PARTICIPATION ELIGIBILITY: By accessing or bidding on the AuctionHub portal, the user represents and warrants that they possess legal age of majority and contractual capacity in their residing jurisdiction.
              </p>
              <p>
                2. NATURE OF THE AUCTION: Every auction is conducted with a declared opening bid and a definitive closing timestamp. Bids placed are unconditional contractual covenants to remit the full stated consideration upon declaration of winning status.
              </p>
              <p>
                3. FALL OF HAMMER: Pursuant to Section 64(2) of the Sale of Goods Act, 1930 and UCC § 2-328(2), the fall of the hammer (signaled by timer expiration at 00:00:00) vests immediate contractual liability on the highest recognized bidder.
              </p>
              <p>
                4. DISCLAIMER OF WARRANTIES: EXCEPT AS EXPLICITLY SET FORTH IN WRITING BY SELLER, LOTS ARE SOLD "AS IS, WHERE IS" WITHOUT RECOURSE. THE PLATFORM DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY AND FITNESS FOR USE.
              </p>
              <p>
                5. DIGITAL RECORDS & SIGNATURES: In accordance with statutory electronic transaction acts (including the ESIGN Act and IT Act 2000), cryptographic audit logs and server timestamps serve as prima facie legal evidence of transaction authenticity.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Binding on all platform buyers & sellers</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 transition cursor-pointer"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
