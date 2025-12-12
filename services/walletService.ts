import { PortfolioPosition } from "../types";

// Types
export interface WalletResult {
  success: boolean;
  address?: string;
  assets?: {
    symbol: string;
    amount: number;
  }[];
  error?: string;
}

// NOTE: Switched to simulation mode to prevent 'Buffer not defined' and other polyfill errors 
// common with @solana/web3.js and ethers.js in strict Vite environments without heavy config.
// This ensures the dashboard UI is fully viewable and interactive for the demo.

export const walletService = {
  // --- EVM (MetaMask/Rabby) Simulation ---
  connectEVM: async (): Promise<WalletResult> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Check if "ethereum" exists just for realism, but don't depend on it
    const hasEth = typeof window !== 'undefined' && (window as any).ethereum;

    if (!hasEth) {
       // Allow bypassing check for demo purposes if needed, or return error
       // return { success: false, error: "Carteira EVM não detectada." };
    }

    return {
      success: true,
      address: "0x71C...9A21",
      assets: [
        { symbol: 'ETH', amount: 1.45 },
        { symbol: 'BNB', amount: 5.2 },
        { symbol: 'USDT', amount: 12500.00 }
      ]
    };
  },

  // --- Solana (Phantom/Solflare) Simulation ---
  connectSolana: async (): Promise<WalletResult> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    return {
      success: true,
      address: "H7f...3kL",
      assets: [
        { symbol: 'SOL', amount: 145.5 },
        { symbol: 'JUP', amount: 3500 }
      ]
    };
  },

  // Helper para mesclar ativos da carteira com o portfólio existente
  mergePositions: (
    currentPositions: PortfolioPosition[], 
    walletAssets: { symbol: string, amount: number }[],
    walletType: string
  ): PortfolioPosition[] => {
    
    // Mapeia preços aproximados para os ativos nativos para calcular valor em USD
    const prices: Record<string, number> = {
      'ETH': 2750.20,
      'BNB': 640.10,
      'SOL': 210.60,
      'USDT': 1.00,
      'JUP': 1.20
    };

    const newPositions = [...currentPositions];

    walletAssets.forEach(asset => {
      const existingIndex = newPositions.findIndex(p => p.symbol === asset.symbol && p.source === 'WALLET');
      const price = prices[asset.symbol] || 0;
      const valueUsd = asset.amount * price;

      if (existingIndex >= 0) {
        newPositions[existingIndex].amount = asset.amount;
        newPositions[existingIndex].valueUsd = valueUsd;
        newPositions[existingIndex].currentPrice = price;
      } else {
        newPositions.push({
          id: `wallet-${Date.now()}-${asset.symbol}`,
          coinId: asset.symbol.toLowerCase(),
          symbol: asset.symbol,
          name: asset.symbol,
          amount: asset.amount,
          avgBuyPrice: price * 0.85, // Simula entrada 15% abaixo
          currentPrice: price,
          valueUsd: valueUsd,
          pnlPercent: 15.0,
          pnlUsd: valueUsd * 0.15,
          allocation: 0,
          signal: 'HOLD',
          source: 'WALLET'
        });
      }
    });

    // Recalcula alocação
    const totalVal = newPositions.reduce((acc, p) => acc + p.valueUsd, 0);
    return newPositions.map(p => ({
      ...p,
      allocation: totalVal > 0 ? (p.valueUsd / totalVal) * 100 : 0
    }));
  }
};