import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar (USD)', rateFromUSD: 1.0 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee (INR)', rateFromUSD: 85.5 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro (EUR)', rateFromUSD: 0.92 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound (GBP)', rateFromUSD: 0.79 },
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('auction_preferred_currency') || 'USD';
  });

  const setCurrency = (code) => {
    if (CURRENCIES[code]) {
      setCurrencyState(code);
      localStorage.setItem('auction_preferred_currency', code);
    }
  };

  /**
   * Converts and formats a given amount (assumed stored in USD base) into the user's active currency.
   */
  const format = (amountInUSD, options = {}) => {
    const numericAmount = Number(amountInUSD || 0);
    const curr = CURRENCIES[currency] || CURRENCIES.USD;
    const converted = numericAmount * curr.rateFromUSD;
    const decimals = options.decimals !== undefined ? options.decimals : converted % 1 === 0 ? 0 : 2;

    return `${curr.symbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  };

  /**
   * Explicitly format an amount in a specific currency without conversion.
   */
  const formatSpecific = (amount, currencyCode, options = {}) => {
    const numericAmount = Number(amount || 0);
    const curr = CURRENCIES[currencyCode] || CURRENCIES.USD;
    const decimals = options.decimals !== undefined ? options.decimals : 2;

    return `${curr.symbol}${numericAmount.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  };

  /**
   * Convert an amount between any two currencies.
   */
  const convert = (amount, fromCode = 'USD', toCode = 'INR') => {
    const fromRate = (CURRENCIES[fromCode] || CURRENCIES.USD).rateFromUSD;
    const toRate = (CURRENCIES[toCode] || CURRENCIES.INR).rateFromUSD;
    const inUSD = Number(amount || 0) / fromRate;
    return inUSD * toRate;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        currentCurrency: CURRENCIES[currency] || CURRENCIES.USD,
        currencies: CURRENCIES,
        format,
        formatSpecific,
        convert,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export default CurrencyContext;
