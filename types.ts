
export enum ViewState {
  LANDING = 'LANDING',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  PRICING = 'PRICING',
  DASHBOARD = 'DASHBOARD',
  DETAIL = 'DETAIL',
  PORTFOLIO = 'PORTFOLIO',
  ALERTS = 'ALERTS',
  SETTINGS = 'SETTINGS',
  AUTO_TRADE = 'AUTO_TRADE'
}

declare global {
  interface Window {
    ethereum?: any;
    solana?: any;
    TradingView?: any;
  }
}

export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  sma8w: number; // 8-week SMA value
  supertrend: 'BULLISH' | 'BEARISH';
  s2fRatio: number; // Stock to Flow deviation (1.0 is aligned)
  // Advanced Metrics
  ath: number;
  athChange: number;
  high24h: number;
  low24h: number;
  totalSupply: number | null;
  maxSupply: number | null;
  circulatingSupply: number;
  fdv: number | null;
}

export interface PortfolioPosition {
  id: string;
  coinId: string;
  symbol: string;
  name: string;
  amount: number;
  avgBuyPrice: number;
  currentPrice: number;
  valueUsd: number;
  pnlPercent: number;
  pnlUsd: number;
  allocation: number;
  signal: 'BUY' | 'SELL' | 'HOLD';
  source: 'WALLET' | 'MANUAL' | 'BOT';
}

export interface ChartPoint {
  date: string;
  price: number;
  sma8w: number;
  supertrend: number;
  fib0: number;
  fib1: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  recommended?: boolean;
}

export interface Alert {
  id: string;
  coinSymbol: string;
  type: 'SMA_CROSS' | 'PRICE_TARGET' | 'SUPERTREND_FLIP' | 'FIB_RETRACEMENT';
  condition: 'ABOVE' | 'BELOW' | 'CROSS_UP' | 'CROSS_DOWN';
  value?: number;
  active: boolean;
  createdAt: string;
}

export interface BotConfig {
  isActive: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'; 
  maxAllocationPerTrade: number; 
  leverage: number; // 1x to 50x
  autoExecute: boolean; // Permission for auto-trading vs Notification
  strategies: {
    sma8w: boolean;
    s2f: boolean;
    dca: boolean;
    fibbo: boolean;
  }
}

export interface BotLog {
  id: string;
  timestamp: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'SIGNAL';
  message: string;
  asset?: string;
}

export interface TradeSignal {
  id: string;
  asset: string;
  direction: 'LONG' | 'SHORT';
  leverage: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  confidence: number;
  reason: string;
  timestamp: number;
}

export interface ActivePosition {
  id: string;
  asset: string;
  direction: 'LONG' | 'SHORT';
  leverage: number;
  entryPrice: number;
  currentPrice: number;
  margin: number;
  pnlUsd: number;
  pnlPercent: number;
  liquidationPrice: number;
}