import React, { useRef, useState } from 'react';
import {
  ShieldCheck,
  Printer,
  Download,
  X,
  CheckCircle2,
  QrCode,
  Building2,
  Award,
  Sparkles,
  Copy,
  Check,
  UserCheck,
  Scissors,
  Layers,
} from 'lucide-react';
import moment from 'moment';

const AuthorizedIdCardModal = ({ isOpen, onClose, user, role = 'buyer' }) => {
  const [activeSide, setActiveSide] = useState('front'); // 'front' | 'back' | 'both'
  const [copiedHash, setCopiedHash] = useState(false);
  const cardRef = useRef(null);

  if (!isOpen || !user) return null;

  const isSeller = role === 'seller' || String(user.userType) === '1';
  const issueDate = moment().format('DD MMM YYYY');
  const expiryDate = isSeller ? moment().add(3, 'years').format('DD MMM YYYY') : 'LIFETIME ACCESS';

  const rawId = (user._id || user.id || user.email || 'USER-AUTH').toString();
  const licenseNumber = isSeller
    ? `AH-LIC-MERCHANT-${rawId.slice(-6).toUpperCase()}-${moment().format('YYYY')}`
    : `AH-BID-PASS-${rawId.slice(-6).toUpperCase()}-${moment().format('YYYY')}`;

  const securityHash = `SEC-${rawId.slice(0, 6)}-${Math.abs(
    rawId.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)
  )
    .toString(16)
    .toUpperCase()}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(licenseNumber);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleDownloadText = () => {
    const textContent = `
================================================================================
           AUCTIONHUB OFFICIAL REGISTRATION & LEGAL CREDENTIAL
================================================================================
Credential Type: ${isSeller ? 'LICENSED CONSIGNOR & AUCTION MERCHANT' : 'VERIFIED QUALIFIED BIDDER PASS'}
Registration No: ${licenseNumber}
Issued To:       ${user.username}
Email / User ID: ${user.email}
Classification:  ${isSeller ? 'Grade-A Certified Title Consignor' : 'Verified Qualified Bidder (Class-I)'}
Issue Date:      ${issueDate}
Valid Thru:      ${expiryDate}
Security Hash:   ${securityHash}

STATUTORY DECLARATION:
${
  isSeller
    ? 'This card certifies that the named holder has been vetted and granted authority to consign, list, and transfer unencumbered title to property through the AuctionHub electronic exchange in compliance with Section 64 of The Sale of Goods Act, 1930 and UCC § 2-328.'
    : 'This card certifies that the named holder is of legal age of majority, has completed platform identity validation, and holds contractual capacity to submit legally binding bids pursuant to electronic commerce statutes.'
}

Issued under the Authority of the AuctionHub Central Registrar & Legal Escrow Registry.
================================================================================
    `;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${licenseNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderFrontCard = (isPrint = false) => (
    <div
      className={`relative w-full rounded-2xl shadow-2xl p-5 sm:p-6 overflow-hidden border transition-all font-sans ${
        isPrint
          ? 'bg-slate-950 text-white border-slate-700 shadow-none'
          : isSeller
          ? 'bg-gradient-to-br from-slate-900 via-emerald-950/90 to-slate-900 border-emerald-500/30 text-white'
          : 'bg-gradient-to-br from-slate-900 via-blue-950/90 to-slate-900 border-blue-500/30 text-white'
      }`}
      style={{ aspectRatio: '1.586 / 1' }}
    >
      {/* Guilloche / Hologram Accent Strip */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 via-amber-300 to-blue-500" />
      <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-white/5 blur-xl pointer-events-none" />

      {/* Card Header */}
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl border ${
              isSeller
                ? 'bg-emerald-600/30 border-emerald-400/40 text-emerald-300'
                : 'bg-blue-600/30 border-blue-400/40 text-blue-300'
            }`}
          >
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm tracking-tight uppercase leading-none">AuctionHub</h4>
            <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block mt-0.5">
              Central Electronic Registry
            </span>
          </div>
        </div>

        <div className="text-right">
          <span
            className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${
              isSeller
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
            }`}
          >
            {isSeller ? 'MERCHANT LICENSE' : 'BIDDER PASS'}
          </span>
          <div className="text-[10px] font-mono text-slate-400 mt-1">{securityHash}</div>
        </div>
      </div>

      {/* User Info & Avatar Section */}
      <div className="flex items-center gap-3 sm:gap-4 my-2 sm:my-3">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 border-2 border-slate-700/80 flex items-center justify-center shrink-0 shadow-inner">
          <UserCheck className={`w-7 h-7 sm:w-8 sm:h-8 ${isSeller ? 'text-emerald-400' : 'text-blue-400'}`} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Authorized Name</div>
          <div className="text-base sm:text-lg font-black text-white truncate tracking-tight">
            {user.username}
          </div>
          <div className="text-xs text-slate-300 font-mono truncate">{user.email}</div>
        </div>
      </div>

      {/* Card Details Footer */}
      <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-800/80 flex items-end justify-between text-[10px]">
        <div>
          <span className="text-slate-400 uppercase block text-[9px] font-semibold">License Number</span>
          <span className="font-mono font-bold text-slate-200">{licenseNumber}</span>
        </div>

        <div className="text-center">
          <span className="text-slate-400 uppercase block text-[9px] font-semibold">Issued Date</span>
          <span className="font-medium text-slate-300">{issueDate}</span>
        </div>

        <div className="text-right">
          <span className="text-slate-400 uppercase block text-[9px] font-semibold">Validity</span>
          <span className="font-bold text-emerald-400">{expiryDate}</span>
        </div>
      </div>
    </div>
  );

  const renderBackCard = (isPrint = false) => (
    <div
      className={`relative w-full rounded-2xl shadow-2xl p-5 sm:p-6 overflow-hidden border border-slate-800 bg-slate-950 text-slate-300 font-sans ${
        isPrint ? 'shadow-none border-slate-700' : ''
      }`}
      style={{ aspectRatio: '1.586 / 1' }}
    >
      {/* Magnetic / Barcode Strip */}
      <div className="w-full h-8 bg-slate-900 border-y border-slate-800 -mx-6 mb-3 sm:mb-4 flex items-center px-6">
        <div className="font-mono text-[9px] text-slate-400 tracking-widest truncate">
          AH*REG*{licenseNumber}*VERIFIED*ESCROW*RECORD
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 items-center">
        <div className="col-span-2 text-[10px] text-slate-400 space-y-1 sm:space-y-1.5 leading-tight">
          <div className="font-bold text-slate-200 uppercase text-[9px]">Statutory Conditions of Use:</div>
          <p>
            1. This identity credential is non-transferable and certifies verified contractual standing on the
            AuctionHub platform.
          </p>
          <p>
            2. {isSeller ? 'Authorized under SOGA 1930 §64 & UCC §2-328.' : 'Irrevocable bidding covenant applies to all placed offers.'}
          </p>
          <div className="font-mono text-[9px] text-slate-500 pt-0.5">
            Issuer Ref: AH-SEC-REG-{rawId.slice(0, 8).toUpperCase()}
          </div>
        </div>

        {/* Synthetic QR Code Box */}
        <div className="flex flex-col items-center justify-center p-2 bg-white rounded-xl shadow-inner">
          <QrCode className="w-14 h-14 sm:w-16 sm:h-16 text-slate-900" />
          <span className="text-[8px] font-mono text-slate-600 font-bold uppercase mt-0.5">Scan to Verify</span>
        </div>
      </div>

      {/* Signature Strip */}
      <div className="mt-3 sm:mt-4 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-500">
        <div className="font-serif italic text-slate-400">Signature: {user.username}</div>
        <div className="flex items-center gap-1 text-emerald-400 font-semibold">
          <CheckCircle2 className="w-3 h-3" />
          <span>Cryptographically Signed</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Hidden during print) */}
        <div className="print:hidden flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl border ${
                isSeller
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
              }`}
            >
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>{isSeller ? 'Authorized Consignor License' : 'Official Bidder ID Pass'}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                    isSeller
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  }`}
                >
                  CR80 Statutory Card
                </span>
              </h3>
              <p className="text-xs text-slate-400">Standard printable legal identity badge (85.6mm × 53.98mm)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print ID Badge</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close ID Card"
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Card Side Toggle */}
        <div className="print:hidden flex justify-center py-3 bg-slate-950/40 border-b border-slate-800/80 shrink-0">
          <div className="inline-flex rounded-xl bg-slate-900 border border-slate-800 p-1 text-xs">
            <button
              onClick={() => setActiveSide('front')}
              className={`px-3 sm:px-4 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                activeSide === 'front' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Front (Badge)
            </button>
            <button
              onClick={() => setActiveSide('back')}
              className={`px-3 sm:px-4 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                activeSide === 'back' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Back (Terms & QR)
            </button>
            <button
              onClick={() => setActiveSide('both')}
              className={`px-3 sm:px-4 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                activeSide === 'both' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Both (Print Sheet)
            </button>
          </div>
        </div>

        {/* Card Canvas Container (Print Target) */}
        <div
          id="printable-id-card"
          ref={cardRef}
          className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center bg-slate-950/60 print:bg-white print:p-0"
        >
          {/* PRINT-ONLY VIEW: Prints both Front and Back side-by-side with fold line */}
          <div className="hidden print:block w-full max-w-2xl mx-auto font-sans">
            <div className="text-center text-xs text-slate-600 mb-3 uppercase tracking-wider font-bold">
              Official AuctionHub Identity Badge — Cut & Fold Template
            </div>
            <div className="flex flex-row items-center justify-center gap-4">
              <div className="w-[85.6mm]">{renderFrontCard(true)}</div>
              <div className="border-r-2 border-dashed border-slate-400 h-[50mm] flex items-center justify-center">
                <Scissors className="w-4 h-4 text-slate-500 rotate-90" />
              </div>
              <div className="w-[85.6mm]">{renderBackCard(true)}</div>
            </div>
            <div className="text-center text-[10px] text-slate-500 mt-3 font-mono">
              SECURITY REGISTRY HASH: {securityHash} | REGISTRATION: {licenseNumber}
            </div>
          </div>

          {/* SCREEN INTERACTIVE VIEW */}
          <div className="print:hidden w-full max-w-md">
            {activeSide === 'front' && renderFrontCard(false)}
            {activeSide === 'back' && renderBackCard(false)}
            {activeSide === 'both' && (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Front Side:
                  </span>
                  {renderFrontCard(false)}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Back Side:
                  </span>
                  {renderBackCard(false)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer (Hidden during print) */}
        <div className="print:hidden px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-300 text-xs">{licenseNumber}</span>
            <button
              onClick={handleCopyHash}
              className="p-1 rounded text-slate-400 hover:text-white transition cursor-pointer"
              title="Copy License Number"
            >
              {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadText}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>Download Record</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/20 transition cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official ID Card</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorizedIdCardModal;
