import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { BotConfig, BotLog, PortfolioPosition, TradeSignal, ActivePosition } from '../types';

interface NexusDB extends DBSchema {
  bot_logs: {
    key: string;
    value: BotLog;
    indexes: { 'by-timestamp': string };
  };
  trade_history: {
    key: string;
    value: ActivePosition;
  };
  config: {
    key: string;
    value: any;
  };
  portfolio: {
    key: string;
    value: PortfolioPosition;
  };
}

const DB_NAME = 'NexusPro_HFT_DB';
const DB_VERSION = 1;

class DatabaseService {
  private dbPromise: Promise<IDBPDatabase<NexusDB>>;

  constructor() {
    this.dbPromise = openDB<NexusDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Logs Store
        if (!db.objectStoreNames.contains('bot_logs')) {
          const logsStore = db.createObjectStore('bot_logs', { keyPath: 'id' });
          logsStore.createIndex('by-timestamp', 'timestamp');
        }
        
        // Trades History Store
        if (!db.objectStoreNames.contains('trade_history')) {
          db.createObjectStore('trade_history', { keyPath: 'id' });
        }

        // Config Store
        if (!db.objectStoreNames.contains('config')) {
          db.createObjectStore('config', { keyPath: 'key' });
        }

        // Portfolio Store
        if (!db.objectStoreNames.contains('portfolio')) {
          db.createObjectStore('portfolio', { keyPath: 'id' });
        }
      },
    });
  }

  // --- LOGS ---
  async addLog(log: BotLog) {
    const db = await this.dbPromise;
    await db.put('bot_logs', log);
    // Keep only last 500 logs to maintain performance
    const count = await db.count('bot_logs');
    if (count > 500) {
      const keys = await db.getAllKeys('bot_logs', null, count - 500);
      const tx = db.transaction('bot_logs', 'readwrite');
      keys.forEach(k => tx.store.delete(k));
      await tx.done;
    }
  }

  async getLogs(limit = 50): Promise<BotLog[]> {
    const db = await this.dbPromise;
    const logs = await db.getAllFromIndex('bot_logs', 'by-timestamp');
    return logs.slice(-limit).reverse(); // Newest first
  }

  // --- CONFIG ---
  async saveConfig(config: BotConfig) {
    const db = await this.dbPromise;
    await db.put('config', { key: 'bot_settings', value: config });
  }

  async getConfig(): Promise<BotConfig | null> {
    const db = await this.dbPromise;
    const res = await db.get('config', 'bot_settings');
    return res ? res.value : null;
  }

  async setLicense(hasLicense: boolean) {
    const db = await this.dbPromise;
    await db.put('config', { key: 'license', value: hasLicense });
  }

  async getLicense(): Promise<boolean> {
    const db = await this.dbPromise;
    const res = await db.get('config', 'license');
    return res ? !!res.value : false;
  }

  // --- TRADES ---
  async saveTrade(trade: ActivePosition) {
    const db = await this.dbPromise;
    await db.put('trade_history', trade);
  }

  async getTrades(): Promise<ActivePosition[]> {
    const db = await this.dbPromise;
    return await db.getAll('trade_history');
  }
}

export const dbService = new DatabaseService();