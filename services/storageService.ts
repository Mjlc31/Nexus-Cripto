import { PortfolioPosition, Alert, BotConfig } from "../types";
import { dbService } from "./database";

// Keys for LocalStorage (Legacy/Sync fallback)
const STORAGE_KEYS = {
  PORTFOLIO: 'nexus_portfolio_v1',
  ALERTS: 'nexus_alerts_v1',
  BOT_CONFIG: 'nexus_bot_config_v2',
  BOT_LICENSE: 'nexus_bot_license_v1'
};

const INITIAL_PORTFOLIO: PortfolioPosition[] = [
  { id: '1', coinId: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', amount: 0.45, avgBuyPrice: 55000, currentPrice: 64230.50, valueUsd: 28903.72, pnlPercent: 16.78, pnlUsd: 4153.72, allocation: 65, signal: 'BUY', source: 'WALLET' },
  { id: '2', coinId: 'ethereum', symbol: 'ETH', name: 'Ethereum', amount: 4.2, avgBuyPrice: 3600, currentPrice: 3450.20, valueUsd: 14490.84, pnlPercent: -4.16, pnlUsd: -629.16, allocation: 30, signal: 'SELL', source: 'WALLET' },
];

const INITIAL_BOT_CONFIG: BotConfig = {
  isActive: false,
  riskLevel: 'MEDIUM',
  maxAllocationPerTrade: 1000,
  leverage: 5,
  strategies: {
    sma8w: true,
    s2f: true,
    dca: true,
    fibbo: false
  },
  autoExecute: false // New flag for permission
};

// --- Hybrid Storage Layer ---

export const storageService = {
  // Portfolio Operations
  getPortfolio: (): PortfolioPosition[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PORTFOLIO);
    return data ? JSON.parse(data) : INITIAL_PORTFOLIO;
  },

  savePortfolio: (positions: PortfolioPosition[]) => {
    localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(positions));
  },

  addPosition: (position: PortfolioPosition) => {
    const current = storageService.getPortfolio();
    const updated = [...current, position];
    storageService.savePortfolio(updated);
    return updated;
  },

  // Bot Configuration Operations (Async DB + Sync Backup)
  getBotConfig: (): BotConfig => {
    // Try Sync first for immediate UI render
    const data = localStorage.getItem(STORAGE_KEYS.BOT_CONFIG);
    const config = data ? JSON.parse(data) : INITIAL_BOT_CONFIG;
    
    // Async update from robust DB
    dbService.getConfig().then(dbConfig => {
      if (dbConfig && JSON.stringify(dbConfig) !== JSON.stringify(config)) {
        console.log('Syncing config from DB...');
        localStorage.setItem(STORAGE_KEYS.BOT_CONFIG, JSON.stringify(dbConfig));
      }
    });

    return config;
  },

  saveBotConfig: (config: BotConfig) => {
    localStorage.setItem(STORAGE_KEYS.BOT_CONFIG, JSON.stringify(config));
    dbService.saveConfig(config);
  },

  // License Operations
  hasBotLicense: (): boolean => {
    return localStorage.getItem(STORAGE_KEYS.BOT_LICENSE) === 'true';
  },

  buyBotLicense: () => {
    localStorage.setItem(STORAGE_KEYS.BOT_LICENSE, 'true');
    dbService.setLicense(true);
  },

  // Alerts Operations
  getAlerts: (): Alert[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
    return data ? JSON.parse(data) : [];
  },

  saveAlerts: (alerts: Alert[]) => {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  },
  
  // Clear Data (Factory Reset)
  resetData: () => {
    localStorage.clear();
    window.location.reload();
  }
};