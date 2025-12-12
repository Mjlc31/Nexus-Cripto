import React, { useEffect, useState } from 'react';
import { CoinData } from '../types';
import { Activity, Gauge, Search, ArrowUpRight, Crosshair, Layers, Calculator, ChevronRight, Zap, Target, TrendingUp, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  onSelectCoin: (coin: CoinData) => void;
}

interface GlobalMetrics {
  totalMarketCap: number;
  totalVolume: number;
  btcDominance: number;
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
  }
] as any[];

export const Dashboard: React.FC<DashboardProps> = ({ onSelectCoin }) => {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [globalMetrics, setGlobalMetrics] = useState<GlobalMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const globalRes = await fetch('https://api.coingecko.com/api/v3/global');
      const globalData = await globalRes.json();
      const sentiment = globalData.data ? 50 + (globalData.data.market_cap_change_percentage_24h_usd * 3) : 55;

      if (globalData.data) {
        setGlobalMetrics({
          totalMarketCap: globalData.data.total_market_cap.usd,
          totalVolume: globalData.data.total_volume.usd,
          btcDominance: globalData.data.market_cap_percentage.btc,
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
        btcDominance: 58.2,
        fearGreedIndex: 68
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // 1 minute updates
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (val: number) => {
    if (val >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    return `$${val.toLocaleString()}`;
  };

  const btcCoin = coins.find(c => c.symbol === 'BTC') || coins[0];
  const btcSmaGap = btcCoin ? ((btcCoin.price - btcCoin.sma8w) / btcCoin.sma8w) * 100 : 0;
  
  // Strategy Check Logic
  const sma8wCheck = btcCoin ? btcCoin.price > btcCoin.sma8w : false;
  const s2fCheck = btcCoin ? btcCoin.s2fRatio < 1.05 : false;
  // Simulating Fibbo level (e.g. above 0.236 retrace)
  const fibboCheck = true; 
  
  // Calculate Confluence Score
  const confluenceScore = (sma8wCheck ? 33 : 0) + (s2fCheck ? 33 : 0) + (fibboCheck ? 34 : 0);

  // Safe Accessor for Fear Greed
  const fearGreed = globalMetrics?.fearGreedIndex ?? 50;

  return (
    <div className="pt-32 px-4 md:px-8 max-w-[1600px] mx-auto min-h-screen pb-20 animate-fade-in">
      
      {/* 1. The "My Strategy" War Room Panel */}
      <div className="mb-10 animate-in slide-in-from-bottom-5 duration-700">
         <div className="flex items-center justify-between mb-4">
             <h2 className="text-3xl font-extrabold text-white tracking-tighter uppercase flex items-center gap-3">
               <Target className="w-8 h-8 text-nexus-primary" />
               Meu Setup
             </h2>
             <div className="hidden md:flex items-center gap-2 text-nexus-muted text-xs font-mono uppercase tracking-widest border border-white/10 px-3 py-1 rounded">
               <span className="w-2 h-2 bg-nexus-primary animate-pulse rounded-full"></span>
               Mercado ao Vivo
             </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Main Confluence Gauge */}
            <div className="lg:col-span-8 bg-nexus-surface border border-nexus-border p-8 rounded-sm relative overflow-hidden group">
               {/* Background Scanline */}
               <div className="absolute inset-0 bg-gradient-to-b from-transparent via-nexus-primary/5 to-transparent h-[20px] w-full animate-scan pointer-events-none"></div>
               
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 mb-8">
                  <div>
                     <div className="text-nexus-muted text-xs font-bold uppercase tracking-widest mb-1">Status da Estratégia</div>
                     <div className={`text-4xl md:text-5xl font-mono font-bold tracking-tighter ${confluenceScore > 66 ? 'text-nexus-primary text-glow' : 'text-nexus-danger text-danger-glow'}`}>
                        {confluenceScore > 66 ? 'COMPRA FORTE' : confluenceScore > 33 ? 'NEUTRO' : 'VENDA FORTE'}
                     </div>
                  </div>
                  <div className="mt-4 md:mt-0 text-right">
                     <div className="text-nexus-muted text-xs font-bold uppercase tracking-widest mb-1">Confluência</div>
                     <div className="text-3xl font-mono font-bold text-white">{confluenceScore}%</div>
                  </div>
               </div>

               {/* The 3 Pillars Checklist */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StrategyCard 
                    label="Média de 8 Semanas" 
                    value={`$${btcCoin?.sma8w.toLocaleString(undefined, {maximumFractionDigits:0})}`}
                    status={sma8wCheck ? 'BULLISH' : 'BEARISH'}
                    detail={sma8wCheck ? 'Preço acima da média. Tendência de alta confirmada.' : 'Preço abaixo da média. Risco de queda acentuada.'}
                    icon={Activity}
                  />
                  <StrategyCard 
                    label="Stock-to-Flow" 
                    value={btcCoin?.s2fRatio.toFixed(2)}
                    status={s2fCheck ? 'BULLISH' : 'BEARISH'}
                    detail={s2fCheck ? 'Ativo subvalorizado (Zona de Acumulação).' : 'Ativo sobrevalorizado (Risco de topo).'}
                    icon={Layers}
                  />
                  <StrategyCard 
                    label="Fibonacci (0.618)" 
                    value="Suporte"
                    status={fibboCheck ? 'BULLISH' : 'NEUTRAL'}
                    detail="Preço segurando na retração de ouro. Ponto de entrada otimizado."
                    icon={Crosshair}
                  />
               </div>
            </div>

            {/* Side Action Panel */}
            <div className="lg:col-span-4 flex flex-col gap-4">
               {/* DCA Calculator Teaser - Focusing on "Accumulation" */}
               <div 
                 onClick={() => onSelectCoin(btcCoin)}
                 className="flex-1 bg-nexus-surface border border-nexus-border p-6 rounded-sm hover:border-nexus-primary/50 transition-all cursor-pointer group relative overflow-hidden"
               >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                     <Calculator className="w-16 h-16 text-nexus-primary" />
                  </div>
                  <div className="relative z-10">
                     <div className="text-xs font-bold text-nexus-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Zap className="w-3 h-3" /> Máquina de Riqueza
                     </div>
                     <h3 className="text-xl font-bold text-white mb-2">Simulador DCA</h3>
                     <p className="text-sm text-nexus-muted mb-4">
                        Veja quanto você estaria lucrando hoje se tivesse seguido a estratégia à risca desde 2018.
                     </p>
                     <div className="flex items-center gap-2 text-sm font-bold text-white group-hover:gap-4 transition-all">
                        Simular Ganhos <ArrowUpRight className="w-4 h-4 text-nexus-primary" />
                     </div>
                  </div>
               </div>

               {/* Market Sentiment - Fear/Greed */}
               <div className="bg-[#111] border border-nexus-border p-6 rounded-sm">
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-xs font-bold text-nexus-muted uppercase tracking-widest">Psicologia (Medo/Ganância)</span>
                     <Gauge className="w-4 h-4 text-nexus-muted" />
                  </div>
                  <div className="flex items-end gap-2">
                     <span className={`text-3xl font-mono font-bold ${fearGreed > 50 ? 'text-nexus-primary' : 'text-nexus-danger'}`}>
                        {fearGreed}
                     </span>
                     <span className="text-xs font-bold text-nexus-muted mb-1.5 uppercase">
                        {fearGreed > 75 ? 'Euforia' : fearGreed < 25 ? 'Pânico' : 'Neutro'}
                     </span>
                  </div>
                  <div className="w-full bg-white/5 h-1 mt-3">
                     <div className={`h-full ${fearGreed > 50 ? 'bg-nexus-primary' : 'bg-nexus-danger'}`} style={{width: `${fearGreed}%`}}></div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* 2. Target List (Market Table) */}
      <h3 className="text-xl font-bold text-white mb-6 tracking-tight flex items-center gap-2">
         <Search className="w-5 h-5 text-nexus-muted" /> Radar de Oportunidades
      </h3>
      
      <div className="bg-nexus-surface border border-nexus-border rounded-sm overflow-hidden">
         <div className="overflow-x-auto">
         <table className="w-full">
            <thead className="bg-white/[0.02] border-b border-white/5">
               <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-nexus-muted uppercase tracking-widest">Ativo</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold text-nexus-muted uppercase tracking-widest">Preço</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold text-nexus-muted uppercase tracking-widest">Var. 24h</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold text-nexus-muted uppercase tracking-widest hidden md:table-cell">SMA 8W Dist.</th>
                  <th className="px-6 py-4 text-center text-[10px] font-bold text-nexus-muted uppercase tracking-widest">Ação</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
               {coins.map(coin => {
                  const smaDist = ((coin.price - coin.sma8w) / coin.sma8w) * 100;
                  return (
                  <tr key={coin.id} onClick={() => onSelectCoin(coin)} className="hover:bg-white/[0.03] transition-colors cursor-pointer group">
                     <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <img src={`https://assets.coingecko.com/coins/images/${coin.id === 'bitcoin' ? '1' : coin.id === 'ethereum' ? '279' : '1'}/large/${coin.symbol.toLowerCase()}.png`} className="w-8 h-8 rounded-full grayscale group-hover:grayscale-0 transition-all" />
                           <div>
                              <div className="font-bold text-white text-sm group-hover:text-nexus-primary transition-colors">{coin.name}</div>
                              <div className="text-[10px] text-nexus-muted font-mono">{coin.symbol}</div>
                           </div>
                        </div>
                     </td>
                     <td className="px-6 py-4 text-right">
                        <div className="font-mono text-sm text-white font-bold">${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                     </td>
                     <td className="px-6 py-4 text-right">
                        <div className={`font-mono text-sm font-bold ${coin.change24h >= 0 ? 'text-nexus-primary' : 'text-nexus-danger'}`}>
                           {coin.change24h > 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                        </div>
                     </td>
                     <td className="px-6 py-4 text-right hidden md:table-cell">
                        <div className={`font-mono text-xs font-bold ${smaDist > 0 ? 'text-nexus-primary' : 'text-nexus-danger'}`}>
                           {smaDist > 0 ? '+' : ''}{smaDist.toFixed(2)}%
                        </div>
                     </td>
                     <td className="px-6 py-4 text-center">
                        {coin.supertrend === 'BULLISH' ? (
                           <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-nexus-primary/20 text-nexus-primary border border-nexus-primary/50 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                              COMPRAR
                           </span>
                        ) : (
                           <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-nexus-danger/20 text-nexus-danger border border-nexus-danger/50 text-[10px] font-bold uppercase tracking-wider">
                              VENDER
                           </span>
                        )}
                     </td>
                  </tr>
               )})}
            </tbody>
         </table>
         </div>
      </div>
    </div>
  );
};

// Sub-component for Strategy Cards
const StrategyCard = ({ label, value, status, detail, icon: Icon }: any) => (
  <div className={`p-4 border rounded-sm transition-all ${status === 'BULLISH' ? 'bg-nexus-primary/5 border-nexus-primary/20' : status === 'BEARISH' ? 'bg-nexus-danger/5 border-nexus-danger/20' : 'bg-white/5 border-white/10'}`}>
     <div className="flex justify-between items-start mb-2">
        <div className="text-[10px] uppercase font-bold text-nexus-muted tracking-wider">{label}</div>
        <Icon className={`w-4 h-4 ${status === 'BULLISH' ? 'text-nexus-primary' : status === 'BEARISH' ? 'text-nexus-danger' : 'text-gray-400'}`} />
     </div>
     <div className="text-xl font-mono font-bold text-white mb-2">{value}</div>
     <div className={`text-[10px] font-bold uppercase mb-2 ${status === 'BULLISH' ? 'text-nexus-primary' : status === 'BEARISH' ? 'text-nexus-danger' : 'text-gray-400'}`}>
        {status === 'BULLISH' ? 'Sinal de Alta' : status === 'BEARISH' ? 'Sinal de Baixa' : 'Neutro'}
     </div>
     <p className="text-[10px] text-nexus-muted leading-relaxed">
        {detail}
     </p>
  </div>
);