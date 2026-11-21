import React from 'react';
import { useCurrency, CURRENCIES } from '../context/CurrencyContext';
import { Coins } from 'lucide-react';

const CurrencySelector = ({ compact = false, className = '' }) => {
  const { currency, setCurrency, currentCurrency } = useCurrency();

  return (
    <div className={`relative inline-flex items-center gap-1.5 ${className}`}>
      {!compact && <Coins className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className="bg-slate-900/90 border border-slate-800 text-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 outline-none cursor-pointer hover:border-slate-700 focus:border-emerald-500 transition"
        title="Select display currency"
      >
        {Object.values(CURRENCIES).map((c) => (
          <option key={c.code} value={c.code}>
            {compact ? `${c.symbol} ${c.code}` : `${c.symbol} ${c.code} - ${c.name}`}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CurrencySelector;
