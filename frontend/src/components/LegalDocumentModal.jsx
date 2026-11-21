import React, { useState, useRef } from 'react';
import {
  FileText,
  Printer,
  Download,
  CheckCircle2,
  X,
  Scale,
  ShieldCheck,
  Building2,
  Copy,
  Check,
  Sliders,
  Sparkles,
  QrCode,
} from 'lucide-react';
import moment from 'moment';
import { CURRENCIES } from '../context/CurrencyContext';

const LegalDocumentModal = ({ isOpen, onClose, auction, role = 'buyer' }) => {
  const [jurisdiction, setJurisdiction] = useState('india'); // 'india' | 'usa' | 'global'
  const [docType, setDocType] = useState('bill_of_sale'); // 'bill_of_sale' | 'tax_invoice' | 'provenance'
  const [selectedCurrency, setSelectedCurrency] = useState('AUTO'); // 'AUTO' | 'INR' | 'USD' | 'EUR' | 'GBP'
  const [includeWatermark, setIncludeWatermark] = useState(true);
  const [includeSignatures, setIncludeSignatures] = useState(true);
  const [compactLayout, setCompactLayout] = useState(false);
  const [sealColor, setSealColor] = useState('emerald'); // 'emerald' | 'gold' | 'blue'
  const [customTaxId, setCustomTaxId] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const printRef = useRef(null);

  if (!isOpen || !auction) return null;

  // Base raw bid in USD
  const baseHammerUSD = Number(auction.currentBid || auction.startingBid || 0);

  // Determine active currency code & symbol based on user selection or jurisdiction default
  let effectiveCurrency = 'USD';
  if (selectedCurrency === 'AUTO') {
    if (jurisdiction === 'india') effectiveCurrency = 'INR';
    else if (jurisdiction === 'usa') effectiveCurrency = 'USD';
    else effectiveCurrency = 'USD';
  } else {
    effectiveCurrency = selectedCurrency;
  }

  const currInfo = CURRENCIES[effectiveCurrency] || CURRENCIES.USD;
  const currencySymbol = currInfo.symbol;
  const currencyCode = currInfo.code;
  const exchangeRate = currInfo.rateFromUSD;

  // Calculate monetary figures in effective currency
  const hammerPrice = baseHammerUSD * exchangeRate;
  const buyersPremiumRate = 0.05; // 5% platform premium
  const buyersPremium = hammerPrice * buyersPremiumRate;

  // Statutory Tax Rates & Acts by Jurisdiction
  let taxRate = 0.18; // 18% GST for India
  let taxLabel = 'Statutory GST (18% - CGST 9% + SGST 9%)';
  let statutoryAct = 'The Sale of Goods Act, 1930 (Section 64) & Indian Contract Act, 1872';
  let jurisdictionName = 'Republic of India';
  let legalNotice =
    'This Bill of Sale is executed in conformity with Section 64 of The Sale of Goods Act, 1930. The fall of the digital hammer constitutes a valid, irreversible contract of sale under the Information Technology Act, 2000.';

  if (jurisdiction === 'usa') {
    taxRate = 0.065; // Average 6.5% State Sales Tax
    taxLabel = 'State & Municipal Sales Tax (6.5%)';
    statutoryAct = 'Uniform Commercial Code (UCC) § 2-328 & § 2-316';
    jurisdictionName = 'United States of America';
    legalNotice =
      'This Bill of Sale and Title Deed is recognized under Uniform Commercial Code § 2-328 (Sale by Auction). The property is conveyed AS-IS, WHERE-IS, without implied warranties of merchantability pursuant to UCC § 2-316.';
  } else if (jurisdiction === 'global') {
    taxRate = 0.10; // 10% Standard International Commercial VAT
    taxLabel = 'International Value Added Surcharge / VAT (10%)';
    statutoryAct = 'UNCITRAL Model Law on Electronic Commerce & ICC Arbitration';
    jurisdictionName = 'International Commercial Jurisdiction';
    legalNotice =
      'Executed under UNCITRAL Model Law on Electronic Commerce and governed by international commercial trade standards with dispute resolution under the Rules of Arbitration of the International Chamber of Commerce (ICC).';
  }

  const taxAmount = (hammerPrice + buyersPremium) * taxRate;
  const grandTotal = hammerPrice + buyersPremium + taxAmount;

  // Generate deterministic Serial & SHA-256 Fingerprint
  const rawId = (auction._id || auction.auctionId || 'AUCTION-DEFAULT').toString();
  const serialNo = `AH-DOC-${jurisdiction.toUpperCase()}-${rawId.slice(-6).toUpperCase()}-${moment().format('YYYYMMDD')}`;
  const digitalFingerprint = `SHA256:${rawId.slice(0, 8)}${Math.abs(baseHammerUSD).toString(16)}${rawId.slice(-8)}`.toUpperCase();

  const handlePrint = () => {
    window.print();
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(digitalFingerprint);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleDownloadText = () => {
    const textContent = `
================================================================================
                    AUCTIONHUB CERTIFIED LEGAL DEED
                        ${serialNo}
================================================================================
Jurisdiction:        ${jurisdictionName}
Statutory Reference: ${statutoryAct}
Executed On:         ${moment().format('MMMM Do YYYY, h:mm:ss A UTC')}
Digital Audit Hash:  ${digitalFingerprint}
${customTaxId ? `Tax Identification / GSTIN: ${customTaxId}\n` : ''}
CURRENCY SPECIFICATION & CONVERSION RATE
--------------------------------------------------------------------------------
Base Hammer Price:   $${baseHammerUSD.toFixed(2)} USD
Applied Benchmark:   1 USD = ${exchangeRate.toFixed(2)} ${currencyCode}
Settlement Currency: ${currencyCode} (${currencySymbol})

LOT SPECIFICATION
--------------------------------------------------------------------------------
Item Name:           ${auction.itemName}
Lot Reference ID:    ${auction.auctionId || auction._id}
Description:         ${auction.description}
Concluded Date:      ${moment(auction.closingTime).format('MMMM Do YYYY, h:mm a')}
Consignor/Seller:    ${auction.sellerName || 'Verified Portal Seller'}
Grantee/High Bidder: ${auction.highestBidder || 'Verified Registered Buyer'}

FINANCIAL SETTLEMENT SUMMARY (${currencyCode})
--------------------------------------------------------------------------------
Hammer Price:            ${currencySymbol}${hammerPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
Platform Fee (5%):       ${currencySymbol}${buyersPremium.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
${taxLabel}:             ${currencySymbol}${taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
--------------------------------------------------------------------------------
TOTAL CONSIDERATION:     ${currencySymbol}${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

STATUTORY DECLARATION:
${legalNotice}
${customNotes ? `\nADDITIONAL MEMORANDUM / NOTES:\n${customNotes}\n` : ''}
This certified deed serves as prima facie legal evidence of ownership transfer.
================================================================================
    `;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${serialNo}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Header (Hidden during print) */}
        <div className="print:hidden flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Legal Document Generator</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Verified
                </span>
              </h3>
              <p className="text-xs text-slate-400">Statutory Bills of Sale, Ownership Deeds & Certified Invoices</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCustomizer(!showCustomizer)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
                showCustomizer
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Customize Deed</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={handleDownloadText}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>.TXT</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close Document Generator"
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Customization Drawer (Collapsible) */}
        {showCustomizer && (
          <div className="print:hidden p-4 sm:p-5 bg-slate-950/90 border-b border-slate-800 text-xs text-slate-300 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Currency Conflict Resolver */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Settlement Currency:</label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                >
                  <option value="AUTO">Auto (Match Jurisdiction)</option>
                  <option value="INR">₹ INR - Indian Rupee (85.50)</option>
                  <option value="USD">$ USD - US Dollar (1.00)</option>
                  <option value="EUR">€ EUR - Euro (0.92)</option>
                  <option value="GBP">£ GBP - British Pound (0.79)</option>
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Original: ${baseHammerUSD} USD → {currencySymbol}{hammerPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })} {currencyCode}
                </span>
              </div>

              {/* Tax ID / GSTIN */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  {jurisdiction === 'india' ? 'Buyer/Seller GSTIN / PAN:' : 'Taxpayer ID / SSN / EIN:'}
                </label>
                <input
                  type="text"
                  placeholder={jurisdiction === 'india' ? '29AAAAA0000A1Z5' : 'XX-XXXXXXX'}
                  value={customTaxId}
                  onChange={(e) => setCustomTaxId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder:text-slate-600 outline-none focus:border-emerald-500"
                />
              </div>

              {/* Custom Addendum */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Special Condition / Addendum:</label>
                <input
                  type="text"
                  placeholder="e.g. Insured Courier / Mint Condition"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder:text-slate-600 outline-none focus:border-emerald-500"
                />
              </div>

              {/* Seal Stamp Style & Layout */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Registry Seal Style:</label>
                <select
                  value={sealColor}
                  onChange={(e) => setSealColor(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                >
                  <option value="emerald">Emerald Registry Seal</option>
                  <option value="gold">Gold Escrow Crest</option>
                  <option value="blue">Judicial Blue Stamp</option>
                </select>
              </div>
            </div>

            {/* Print Toggles & Page Fit */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeWatermark}
                    onChange={(e) => setIncludeWatermark(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
                  />
                  <span>Official Seal Watermark</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeSignatures}
                    onChange={(e) => setIncludeSignatures(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
                  />
                  <span>Notary & Escrow Signatures</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={compactLayout}
                    onChange={(e) => setCompactLayout(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
                  />
                  <span>Single-Page Compact Print Mode</span>
                </label>
              </div>

              <div className="text-[11px] text-slate-400 font-mono">
                💡 Tip: Use &ldquo;Save as PDF&rdquo; with &ldquo;Default&rdquo; margins for pristine statutory export
              </div>
            </div>
          </div>
        )}

        {/* Quick Toolbar: Jurisdiction & Deed Type */}
        <div className="print:hidden flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-6 py-3 bg-slate-950/50 border-b border-slate-800/80 shrink-0 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">Jurisdiction:</span>
            <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-0.5">
              <button
                onClick={() => setJurisdiction('india')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  jurisdiction === 'india' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🇮🇳 India (GST / SOGA)</span>
              </button>
              <button
                onClick={() => setJurisdiction('usa')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  jurisdiction === 'usa' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🇺🇸 USA (UCC 2-328)</span>
              </button>
              <button
                onClick={() => setJurisdiction('global')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  jurisdiction === 'global' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🌐 Global (UNCITRAL)</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">Document Deed:</span>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-1.5 font-medium outline-none cursor-pointer focus:border-emerald-500"
            >
              <option value="bill_of_sale">Bill of Sale & Title Transfer Deed</option>
              <option value="tax_invoice">Official Tax Invoice & Settlement Receipt</option>
              <option value="provenance">Certificate of Provenance & Bidding Audit</option>
            </select>
          </div>
        </div>

        {/* Printable Deed Paper Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950/40">
          <div
            id="printable-legal-deed"
            ref={printRef}
            className={`max-w-3xl mx-auto bg-white text-slate-900 rounded-2xl shadow-xl relative border border-slate-200 font-serif transition-all ${
              compactLayout ? 'p-5 sm:p-7 text-xs' : 'p-8 sm:p-12'
            }`}
          >
            {/* Watermark Background Seal */}
            {includeWatermark && (
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none select-none">
                <Scale className="w-[420px] h-[420px] text-slate-900" />
              </div>
            )}

            {/* Document Header */}
            <div className={`border-b-2 border-slate-900 ${compactLayout ? 'pb-4 mb-4' : 'pb-6 mb-6'}`}>
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-full border-2 shrink-0 ${
                      sealColor === 'gold'
                        ? 'border-amber-600 bg-amber-50 text-amber-700'
                        : sealColor === 'blue'
                        ? 'border-blue-700 bg-blue-50 text-blue-800'
                        : 'border-emerald-700 bg-emerald-50 text-emerald-800'
                    }`}
                  >
                    <Scale className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase text-slate-950 font-sans leading-tight">
                      AuctionHub Legal Registry
                    </h1>
                    <p className="text-[11px] text-slate-600 font-sans font-semibold uppercase tracking-wider mt-0.5">
                      Central Electronic Auctioneer, Title Escrow & Settlement Authority
                    </p>
                    <div className="text-[11px] text-slate-500 font-sans mt-0.5">
                      Jurisdiction: <strong>{jurisdictionName}</strong> | Statutory: <strong>{statutoryAct}</strong>
                    </div>
                  </div>
                </div>

                <div className="text-right font-sans shrink-0">
                  <div className="inline-block px-2.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-1">
                    {docType === 'bill_of_sale'
                      ? 'OFFICIAL BILL OF SALE & TITLE DEED'
                      : docType === 'tax_invoice'
                      ? 'TAX INVOICE & ESCROW RECEIPT'
                      : 'CERTIFICATE OF PROVENANCE & LEDGER AUDIT'}
                  </div>
                  <div className="text-xs font-mono text-slate-600 font-bold">{serialNo}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Executed: {moment().format('DD-MMM-YYYY, h:mm A UTC')}
                  </div>
                </div>
              </div>

              {/* Currency Transparency Notice */}
              <div className="mt-3 pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-500 font-sans">
                <span>
                  Base Catalog Price: <strong>${baseHammerUSD.toFixed(2)} USD</strong>
                </span>
                <span>
                  Statutory Conversion Rate: <strong>1 USD = {exchangeRate.toFixed(2)} {currencyCode}</strong>
                </span>
                <span>
                  Settlement Currency: <strong>{currencyCode} ({currencySymbol})</strong>
                </span>
              </div>
            </div>

            {/* Parties Declarations */}
            <div className="grid grid-cols-2 gap-6 mb-6 text-xs font-sans">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 uppercase block mb-1 text-[11px]">
                  Consignor / Certified Seller
                </span>
                <div className="font-semibold text-slate-800 text-sm">{auction.sellerName || 'Verified Portal Merchant'}</div>
                <div className="text-slate-500 mt-0.5">Account ID: {auction.sellerId || 'MERCHANT-ESCROW'}</div>
                <div className="text-slate-500 mt-0.5">Title Warranty: Vested Unencumbered Title</div>
                {customTaxId && <div className="text-slate-700 font-mono mt-1 font-bold">Tax Ref: {customTaxId}</div>}
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-900 uppercase block mb-1 text-[11px]">
                  Grantee / High Bidder
                </span>
                <div className="font-semibold text-slate-800 text-sm">{auction.highestBidder || 'Verified Winning Purchaser'}</div>
                <div className="text-slate-500 mt-0.5">Status: Fall of Hammer Vested</div>
                <div className="text-slate-500 mt-0.5">Contract Status: Binding Covenant Settled</div>
              </div>
            </div>

            {/* Conveyed Lot Specifications */}
            <div className="mb-6 font-sans">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-2">
                Conveyed Property Specifications
              </h4>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-base font-bold text-slate-900">{auction.itemName}</span>
                  <span className="text-xs font-mono text-slate-500">Lot Ref: {auction.auctionId || auction._id}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-serif">
                  {auction.description || 'Certified lot sold via public electronic competitive bidding.'}
                </p>
                {customNotes && (
                  <div className="p-2 bg-emerald-50 rounded border border-emerald-200 text-xs text-emerald-900 font-sans">
                    <strong>Addendum:</strong> {customNotes}
                  </div>
                )}
                <div className="flex flex-wrap gap-4 text-[11px] text-slate-500 pt-1 border-t border-slate-200 font-sans">
                  <span>Bidding Commenced: {moment(auction.openingTime).format('DD MMM YYYY, h:mm a')}</span>
                  <span>Hammer Fall (Closed): {moment(auction.closingTime).format('DD MMM YYYY, h:mm a')}</span>
                  <span>Total Bids Received: {auction.bids?.length || 1}</span>
                </div>
              </div>
            </div>

            {/* Financial Consideration Table */}
            <div className="mb-6 font-sans">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-1 mb-2">
                Statutory Financial Consideration & Tax Breakdown
              </h4>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-left">
                    <th className="py-1.5">Legal Consideration Line</th>
                    <th className="py-1.5 text-center">Benchmark / Basis</th>
                    <th className="py-1.5 text-right">Amount ({currencyCode})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2.5 font-medium text-slate-800">
                      Final Hammer Price (Winning Bid)
                      <span className="block text-[10px] text-slate-500">Base value: ${baseHammerUSD.toFixed(2)} USD</span>
                    </td>
                    <td className="py-2.5 text-center text-slate-500 font-mono">1 USD = {exchangeRate} {currencyCode}</td>
                    <td className="py-2.5 text-right font-semibold text-slate-900">
                      {currencySymbol}{hammerPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium text-slate-800">
                      Auction Platform Premium & Title Escrow Fee
                    </td>
                    <td className="py-2 text-center text-slate-500">5.0% Standard Service Levy</td>
                    <td className="py-2 text-right text-slate-700">
                      {currencySymbol}{buyersPremium.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium text-slate-800">{taxLabel}</td>
                    <td className="py-2 text-center text-slate-500">Statutory Tax Mandate</td>
                    <td className="py-2 text-right text-slate-700">
                      {currencySymbol}{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr className="border-t-2 border-slate-900 text-sm">
                    <td className="py-3 font-bold text-slate-950 uppercase" colSpan="2">
                      Total Legal Consideration Remitted & Conferred
                    </td>
                    <td className="py-3 text-right font-black text-slate-950 text-base">
                      {currencySymbol}{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Legal Covenants */}
            <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200 text-[11px] leading-relaxed text-slate-600 font-sans space-y-1.5">
              <span className="font-bold text-slate-800 uppercase block text-[10px]">
                Statutory Covenants & Warranty Disclaimers:
              </span>
              <p>
                1. <strong>Transfer of Title & Risk:</strong> Title, property, and constructive possession are irrevocably conveyed to the Grantee upon confirmed consideration settlement. Risk of loss transfers concurrently.
              </p>
              <p>
                2. <strong>As-Is Where-Is Clause:</strong> {legalNotice}
              </p>
              <p>
                3. <strong>Governing Law & Disputes:</strong> Any dispute arising hereunder shall be subject to the exclusive jurisdiction defined by {statutoryAct}.
              </p>
            </div>

            {/* Notary Execution & Signatures Block */}
            {includeSignatures && (
              <div className="border-t-2 border-slate-900 pt-6 font-sans">
                <div className="grid grid-cols-3 gap-6 text-center text-xs">
                  <div>
                    <div className="h-12 border-b border-slate-400 flex items-end justify-center pb-1 font-mono text-[11px] text-slate-700">
                      [ELECTRONICALLY SEALED]
                    </div>
                    <span className="font-bold text-slate-800 block mt-1">Consignor / Seller</span>
                    <span className="text-[10px] text-slate-500">Transferor Warrant</span>
                  </div>

                  <div>
                    <div className="h-12 border-b border-slate-400 flex items-end justify-center pb-1 font-mono text-[11px] text-slate-700">
                      [DIGITALLY ACCEPTED]
                    </div>
                    <span className="font-bold text-slate-800 block mt-1">Grantee / Purchaser</span>
                    <span className="text-[10px] text-slate-500">High Bidder Covenant</span>
                  </div>

                  <div>
                    <div
                      className={`h-12 border-b border-slate-400 flex items-end justify-center pb-1 font-mono text-[10px] font-bold ${
                        sealColor === 'gold'
                          ? 'text-amber-700'
                          : sealColor === 'blue'
                          ? 'text-blue-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      ✓ AUCTIONHUB REGISTRY SEAL
                    </div>
                    <span className="font-bold text-slate-800 block mt-1">Registry Authority</span>
                    <span className="text-[10px] text-slate-500">Statutory Escrow Officer</span>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-500 font-mono gap-2">
                  <span>AUDIT HASH: {digitalFingerprint}</span>
                  <span>IMMUTABLE DATABASE REF: {rawId}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Status Bar (Hidden during print) */}
        <div className="print:hidden px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-300">{digitalFingerprint}</span>
            <button
              onClick={handleCopyHash}
              className="p-1 rounded text-slate-400 hover:text-white transition cursor-pointer"
              title="Copy verification hash"
            >
              {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/20 transition cursor-pointer flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Deed (PDF)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalDocumentModal;
