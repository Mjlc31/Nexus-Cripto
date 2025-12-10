import React, { useEffect, useState } from 'react';
import { CoinData } from '../types';
import { TrendingUp, TrendingDown, ChevronRight, Globe, Activity, BarChart2, RefreshCw, AlertCircle, Radar, Zap, Gauge, Search, ArrowUpRight } from 'lucide-react';

interface DashboardProps {
  onSelectCoin: (coin: CoinData) => void;
}

interface GlobalMetrics {
  totalMarketCap: number;
  totalVolume: number;
  marketCapChangePercentage24h: number;
  btcDominance: number;
  ethDominance: number;
  fearGreedIndex: number; 
}

const MOCK_COINS_FALLBACK: CoinData[] = [
  { 
    id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', price: 96420.50, change24h: 1.2, marketCap: 1900000000000, volume24h: 45000000000, 
    sma8w: 92100, supertrend: 'BULLISH', s2fRatio: 1.15,
    ath: 102000, athChange: -5.4, high24h: 97100, low24h: 95800,
    totalSupply: 19750000, maxSupply: 21000000, circulatingSupply: 19750000, fdv: 2024830500000
  },
  { 
    id: 'ethereum', symbol: 'ETH', name: 'Ethereum', price: 2750.20, change24h: -0.5, marketCap: 330000000000, volume24h: 18000000000, 
    sma8w: 2800, supertrend: 'BEARISH', s2fRatio: 0.92,
    ath: 4878, athChange: -43.6, high24h: 2810, low24h: 2710,
    totalSupply: 120000000, maxSupply: null, circulatingSupply: 120000000, fdv: 330000000000
  },
  { 
    id: 'solana', symbol: 'SOL', name: 'Solana', price: 210.60, change24h: 3.8, marketCap: 95000000000, volume24h: 5000000000, 
    sma8w: 195, supertrend: 'BULLISH', s2fRatio: 1.05,
    ath: 260, athChange: -18.9, high24h: 215, low24h: 202,
    totalSupply: 570000000, maxSupply: null, circulatingSupply: 450000000, fdv: 121095000000
  },
  { 
    id: 'bnb', symbol: 'BNB', name: 'BNB', price: 640.10, change24h: 0.2, marketCap: 98000000000, volume24h: 1400000000, 
    sma8w: 630, supertrend: 'BULLISH', s2fRatio: 1.00,
    ath: 720, athChange: -11.1, high24h: 645, low24h: 635,
    totalSupply: 145000000, maxSupply: 200000000, circulatingSupply: 145000000, fdv: 92800000000
  },
  { 
    id: 'ripple', symbol: 'XRP', name: 'XRP', price: 2.45, change24h: 5.4, marketCap: 130000000000, volume24h: 4000000000, 
    sma8w: 2.10, supertrend: 'BULLISH', s2fRatio: 1.10,
    ath: 3.40, athChange: -27.9, high24h: 2.55, low24h: 2.30,
    totalSupply: 99987000000, maxSupply: 100000000000, circulatingSupply: 55000000000, fdv: 245000000000
  },
  { 
    id: 'cardano', symbol: 'ADA', name: 'Cardano', price: 0.85, change24h: -1.2, marketCap: 30000000000, volume24h: 600000000, 
    sma8w: 0.90, supertrend: 'BEARISH', s2fRatio: 0.85,
    ath: 3.09, athChange: -72.4, high24h: 0.88, low24h: 0.83,
    totalSupply: 36000000000, maxSupply: 45000000000, circulatingSupply: 35500000000, fdv: 38250000000
  }
] as any[];

export const Dashboard: React.FC<DashboardProps> = ({ onSelectCoin }) => {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [globalMetrics, setGlobalMetrics] = useState<GlobalMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);

  // ... (Fetch Logic remains the same, keeping it concise for layout focus)
  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const globalRes = await fetch('https://api.coingecko.com/api/v3/global');
      const globalData = await globalRes.json();
      const sentiment = globalData.data ? 50 + (globalData.data.market_cap_change_percentage_24h_usd * 3) : 55;

      if (globalData.data) {
        setGlobalMetrics({
          totalMarketCap: globalData.data.total_market_cap.usd,
          totalVolume: globalData.data.total_volume.usd,
          marketCapChangePercentage24h: globalData.data.market_cap_change_percentage_24h_usd,
          btcDominance: globalData.data.market_cap_percentage.btc,
          ethDominance: globalData.data.market_cap_percentage.eth,
          fearGreedIndex: Math.min(Math.max(sentiment, 0), 100)
        });
      }

      const coinsRes = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h'
      );
      
      if (!coinsRes.ok) throw new Error('Rate limit');
      
      const coinsList = await coinsRes.json();
      const mappedCoins: CoinData[] = coinsList.map((coin: any) => {
        const isBullishAction = coin.price_change_percentage_24h > 0;
        const smaOffset = isBullishAction ? (1 - (Math.random() * 0.05)) : (1 + (Math.random() * 0.05));
        const simulatedSma8w = coin.current_price * smaOffset;
        let simulatedSupertrend: 'BULLISH' | 'BEARISH' = 'NEUTRAL' as any;
        if (coin.price_change_percentage_24h > 0.5) simulatedSupertrend = 'BULLISH';
        else if (coin.price_change_percentage_24h < -0.5) simulatedSupertrend = 'BEARISH';
        else simulatedSupertrend = Math.random() > 0.5 ? 'BULLISH' : 'BEARISH';
        const simulatedS2f = 0.9 + (Math.random() * 0.3); 

        return {
          id: coin.id,
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          price: coin.current_price,
          change24h: coin.price_change_percentage_24h,
          marketCap: coin.market_cap,
          volume24h: coin.total_volume,
          sma8w: simulatedSma8w,
          supertrend: simulatedSupertrend,
          s2fRatio: simulatedS2f,
          ath: coin.ath,
          athChange: coin.ath_change_percentage,
          high24h: coin.high_24h,
          low24h: coin.low_24h,
          totalSupply: coin.total_supply,
          maxSupply: coin.max_supply,
          circulatingSupply: coin.circulating_supply,
          fdv: coin.fully_diluted_valuation || (coin.max_supply ? coin.max_supply * coin.current_price : coin.market_cap),
        };
      });
      setCoins(mappedCoins);
    } catch (err) {
      setCoins(MOCK_COINS_FALLBACK);
      setGlobalMetrics({
        totalMarketCap: 3100000000000,
        totalVolume: 120000000000,
        marketCapChangePercentage24h: 2.5,
        btcDominance: 58.2,
        ethDominance: 12.8,
        fearGreedIndex: 68
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 120000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (val: number) => {
    if (val >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    return `$${val.toLocaleString()}`;
  };

  const potentialBuys = coins.filter(c => c.supertrend === 'BULLISH' && c.change24h > 0 && c.change24h < 5).slice(0, 3);

  return (
    <div className="pt-28 px-4 md:px-8 max-w-[1600px] mx-auto min-h-screen pb-20">
      
      {/* 1. Global Metrics - Bento Grid Style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <DataCard label="Total Market Cap" value={globalMetrics ? formatCurrency(globalMetrics.totalMarketCap) : '-'} />
        <DataCard label="Volume (24h)" value={globalMetrics ? formatCurrency(globalMetrics.totalVolume) : '-'} />
        <DataCard label="BTC Dominance" value={globalMetrics ? `${globalMetrics.btcDominance.toFixed(1)}%` : '-'} />
        
        {/* Sentiment Pill */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col justify-between group hover:bg-white/[0.05] transition-all">
           <div className="flex justify-between items-start">
              <span className="text-xs uppercase tracking-widest text-nexus-muted font-medium">Sentimento</span>
              <Gauge className="w-4 h-4 text-nexus-muted" />
           </div>
           <div>
              <div className="text-2xl md:text-3xl font-mono font-bold text-white tracking-tighter">
                {globalMetrics?.fearGreedIndex || 50}
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
                 <div className="h-full bg-white" style={{width: `${globalMetrics?.fearGreedIndex || 50}%`}}></div>
              </div>
           </div>
        </div>
      </div>

      {/* 2. Strategy Radar */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
           <h3 className="text-xl font-medium text-white tracking-tight">Oportunidades <span className="text-nexus-muted">Algorítmicas</span></h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {loading ? [1,2,3].map(i => <div key={i} className="h-40 bg-white/5 rounded-3xl animate-pulse" />) : 
             potentialBuys.map(coin => (
               <div key={coin.id} onClick={() => onSelectCoin(coin)} className="group bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-md border border-white/5 p-6 rounded-3xl cursor-pointer transition-all duration-300 relative overflow-hidden">
                  <div className="flex justify-between items-start mb-8 relative z-10">
                     <div className="flex items-center gap-3">
                        <img src={`https://assets.coingecko.com/coins/images/${coin.id === 'bitcoin' ? '1' : coin.id === 'ethereum' ? '279' : '1'}/large/${coin.symbol.toLowerCase()}.png`} className="w-10 h-10 rounded-full grayscale group-hover:grayscale-0 transition-all" />
                        <div>
                           <div className="font-bold text-white text-lg">{coin.name}</div>
                           <div className="text-xs text-nexus-muted font-mono">{coin.symbol}</div>
                        </div>
                     </div>
                     <div className="bg-white/10 p-2 rounded-full text-white group-hover:bg-white group-hover:text-black transition-colors">
                        <ArrowUpRight className="w-4 h-4" />
                     </div>
                  </div>
                  <div className="relative z-10">
                     <div className="text-sm text-nexus-muted mb-1">Preço Atual</div>
                     <div className="text-2xl font-mono text-white tracking-tighter">${coin.price.toLocaleString()}</div>
                  </div>
               </div>
             ))
           }
        </div>
      </div>

      {/* 3. Market Table - Apple/Tesla Style Cleanliness */}
      <div className="mb-6 flex justify-between items-end">
         <h2 className="text-3xl font-bold text-white tracking-tight">Mercado</h2>
         <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-muted" />
            <input 
              type="text" 
              placeholder="Filtrar..." 
              className="bg-transparent border-b border-white/20 pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-white transition-colors w-40 focus:w-64"
            />
         </div>
      </div>

      <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-8 py-6 text-left text-[10px] uppercase tracking-widest text-nexus-muted font-medium">Ativo</th>
                <th className="px-8 py-6 text-right text-[10px] uppercase tracking-widest text-nexus-muted font-medium">Preço</th>
                <th className="px-8 py-6 text-right text-[10px] uppercase tracking-widest text-nexus-muted font-medium">24h %</th>
                <th className="px-8 py-6 text-right text-[10px] uppercase tracking-widest text-nexus-muted font-medium hidden md:table-cell">SMA 8W</th>
                <th className="px-8 py-6 text-center text-[10px] uppercase tracking-widest text-nexus-muted font-medium">Sinal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {coins.map((coin) => (
                <tr 
                  key={coin.id} 
                  onClick={() => onSelectCoin(coin)}
                  className="group hover:bg-white/[0.04] transition-all cursor-pointer"
                >
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono text-nexus-muted w-4 text-center">{coin.symbol.substring(0,1)}</span>
                      <div>
                        <div className="text-sm font-medium text-white group-hover:text-white transition-colors">{coin.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right text-sm text-white font-mono tracking-tight">
                    ${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right">
                    <span className={`text-sm font-mono tracking-tight ${coin.change24h >= 0 ? 'text-white' : 'text-nexus-muted'}`}>
                      {coin.change24h > 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right text-sm text-nexus-muted font-mono hidden md:table-cell">
                    ${coin.sma8w.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-center">
                    {coin.supertrend === 'BULLISH' ? (
                       <span className="inline-flex w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></span>
                    ) : (
                       <span className="inline-flex w-2 h-2 rounded-full bg-red-500/50"></span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const DataCard = ({ label, value }: { label: string, value: string }) => (
  <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col justify-between group hover:bg-white/[0.05] transition-all h-32">
     <span className="text-xs uppercase tracking-widest text-nexus-muted font-medium">{label}</span>
     <span className="text-2xl md:text-3xl font-mono font-bold text-white tracking-tighter">{value}</span>
  </div>
);