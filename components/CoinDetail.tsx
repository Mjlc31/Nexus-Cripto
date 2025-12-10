import React, { useEffect, useState, useRef } from 'react';
import { CoinData } from '../types';
import { ArrowLeft, Sparkles, BarChart3, DollarSign, BrainCircuit, Check, TrendingUp, X, Wallet, Clock, Activity, Target, ChevronDown, ChevronUp, RefreshCw, Zap, Calculator, Calendar, Info, Layers, AlertTriangle } from 'lucide-react';
import { analyzeStrategy, TAOGAnalysis } from '../services/geminiService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line, Scatter, ReferenceLine } from 'recharts';

interface CoinDetailProps {
  coin: CoinData;
  onBack: () => void;
}

declare global {
  interface Window {
    TradingView: any;
  }
}

// DCA Simulation Types
interface DCASimulationPoint {
  period: number;
  label: string;
  totalInvested: number;
  portfolioValue: number;
  isPast: boolean; 
  buyPoint?: number;
}

type DCAFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly';

export const CoinDetail: React.FC<CoinDetailProps> = ({ coin, onBack }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<TAOGAnalysis | string | null>(null);
  const [activeTab, setActiveTab] = useState<'chart' | 'dca'>('chart');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderType, setOrderType] = useState<'BUY' | 'SELL' | null>(null);
  const [orderAmount, setOrderAmount] = useState<number>(1000);
  const [chartOverlayOpen, setChartOverlayOpen] = useState(false);
  
  // DCA State
  const [dcaAmount, setDcaAmount] = useState<number>(500);
  const [dcaYears, setDcaYears] = useState<number>(5); // Future years
  const [dcaPastYears, setDcaPastYears] = useState<number>(1); // Simulated past context
  const [dcaTargetApy, setDcaTargetApy] = useState<number>(45); 
  const [dcaFrequency, setDcaFrequency] = useState<DCAFrequency>('monthly');
  const [dcaData, setDcaData] = useState<DCASimulationPoint[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // TradingView Widget Logic - Explicitly depends on activeTab being 'chart'
  useEffect(() => {
    // Clean up any existing script or iframe if tab is not chart
    if (activeTab !== 'chart') {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      return;
    }

    // Only mount if activeTab is chart
    if (activeTab === 'chart' && containerRef.current) {
      containerRef.current.innerHTML = ''; // Ensure empty before mounting
      const script = document.createElement('script');
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = () => {
        if (window.TradingView) {
          new window.TradingView.widget({
            autosize: true,
            symbol: `BINANCE:${coin.symbol}USDT`,
            interval: "D",
            timezone: "Etc/UTC",
            theme: "dark",
            style: "1",
            locale: "br",
            toolbar_bg: "#f1f3f6",
            enable_publishing: false,
            allow_symbol_change: true,
            container_id: "tradingview_widget",
            studies: ["MASimple@tv-basicstudies", "SuperTrend@tv-basicstudies"],
            hide_side_toolbar: false,
            details: true,
            hotlist: true,
            calendar: true,
            withdateranges: true,
          });
        }
      };
      containerRef.current.appendChild(script);

      return () => {
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }
      };
    }
  }, [activeTab, coin.symbol]);

  useEffect(() => {
    if (activeTab === 'dca') {
      calculateDCA();
    }
  }, [activeTab, dcaAmount, dcaYears, dcaTargetApy, dcaFrequency, coin.price, coin.symbol]);

  // --- Advanced DCA Logic ---
  const calculateDCA = () => {
    let periodsPerYear = 12;
    if (dcaFrequency === 'weekly') periodsPerYear = 52;
    if (dcaFrequency === 'biweekly') periodsPerYear = 26;
    if (dcaFrequency === 'quarterly') periodsPerYear = 4;

    const futurePeriods = dcaYears * periodsPerYear;
    const pastPeriods = dcaPastYears * periodsPerYear; // Look back X years
    
    const data: DCASimulationPoint[] = [];
    
    let accumulatedInvested = 0;
    let accumulatedValue = 0;

    // 1. Calculate Historical Simulation (Backtesting Context)
    const volatility = coin.symbol === 'BTC' ? 0.04 : 0.08; 
    const historicalTrend = coin.symbol === 'BTC' ? 0.008 : 0.012; // Monthly drift
    
    // We start "in the past" with 0 value
    for (let i = -pastPeriods; i <= 0; i++) {
        if (i === -pastPeriods) {
            // First buy in the past
            accumulatedInvested = dcaAmount;
            accumulatedValue = dcaAmount;
        } else {
            // Price Action Simulation
            const randomMove = (Math.random() - 0.5) * volatility;
            const trendMove = historicalTrend * (12/periodsPerYear); // Adjust trend per period
            const periodReturn = 1 + randomMove + trendMove;
            
            accumulatedValue = (accumulatedValue * periodReturn) + dcaAmount;
            accumulatedInvested += dcaAmount;
        }

        data.push({
            period: i,
            label: i === 0 ? 'HOJE' : `Period ${i}`,
            totalInvested: accumulatedInvested,
            portfolioValue: accumulatedValue,
            isPast: true,
            buyPoint: accumulatedValue // Show dots for past executions
        });
    }

    // 2. Calculate Future Projection (Compound Interest)
    const ratePerPeriod = Math.pow(1 + (dcaTargetApy / 100), 1 / periodsPerYear) - 1;

    for (let i = 1; i <= futurePeriods; i++) {
        accumulatedInvested += dcaAmount;
        accumulatedValue = (accumulatedValue * (1 + ratePerPeriod)) + dcaAmount;

        // Add slight noise to make it look organic.
        const noise = 1 + ((Math.random() - 0.5) * 0.01); 
        
        data.push({
            period: i,
            label: i === futurePeriods ? 'Meta' : '',
            totalInvested: accumulatedInvested,
            portfolioValue: accumulatedValue * noise,
            isPast: false,
            buyPoint: i % (dcaFrequency === 'weekly' ? 8 : 1) === 0 ? (accumulatedValue * noise) : undefined 
        });
    }

    setDcaData(data);
  };

  const handleAIAnalyze = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    setChartOverlayOpen(true);
    try {
      const result = await analyzeStrategy(coin);
      setAnalysis(result);
    } catch (e) {
      // Fallback
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOrder = (type: 'BUY' | 'SELL') => {
    setOrderType(type);
    setShowOrderModal(true);
  };

  // Simulated Historical Data Service
  const getHistoricalStats = () => {
    const baseStats = {
      'BTC': { '1y': 110, '3y': 45, '5y': 85 },
      'ETH': { '1y': 90, '3y': 35, '5y': 95 },
      'SOL': { '1y': 250, '3y': 120, '5y': 0 },
      'BNB': { '1y': 60, '3y': 25, '5y': 110 },
      'XRP': { '1y': 30, '3y': 10, '5y': 15 },
    };
    return baseStats[coin.symbol as keyof typeof baseStats] || { '1y': 20, '3y': 15, '5y': 25 };
  };

  const historicalStats = getHistoricalStats();

  const formatLargeNumber = (num: number | null) => {
    if (num === null) return '-';
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)} T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)} B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)} M`;
    return num.toLocaleString();
  };

  const supplyProgress = coin.maxSupply ? (coin.circulatingSupply / coin.maxSupply) * 100 : 0;
  
  // Data for Summary Cards
  const finalDataPoint = dcaData[dcaData.length - 1];
  const finalValue = finalDataPoint?.portfolioValue || 0;
  const totalInvested = finalDataPoint?.totalInvested || 0;
  const totalProfitPercent = totalInvested > 0 ? ((finalValue - totalInvested) / totalInvested) * 100 : 0;

  const isStructuredAnalysis = (data: any): data is TAOGAnalysis => {
    return data && typeof data === 'object' && 'verdict' in data;
  };

  const getStatusColor = (status: string) => {
    if (status === 'BULLISH') return 'text-green-400';
    if (status === 'BEARISH') return 'text-red-400';
    return 'text-gray-400';
  }

  const getStatusBg = (status: string) => {
    if (status === 'BULLISH') return 'bg-green-500/10 border-green-500/20';
    if (status === 'BEARISH') return 'bg-red-500/10 border-red-500/20';
    return 'bg-white/5 border-white/5';
  }

  return (
    <div className="pt-24 px-4 md:px-6 max-w-[1600px] mx-auto min-h-screen pb-20">
      <button onClick={onBack} className="flex items-center text-nexus-muted hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Mercado
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        
        {/* Main Section */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          <div className="glass-panel border border-white/10 rounded-3xl p-1 relative overflow-hidden h-[600px] md:h-[700px] flex flex-col shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-nexus-accent z-20 shadow-[0_0_15px_#3B82F6]"></div>
            
            {/* Header Controls - Apple Segmented Control Style */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-nexus-dark z-10 border-b border-white/5 gap-4">
               <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="flex flex-col">
                    <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                       <img src={`https://assets.coingecko.com/coins/images/${coin.id === 'bitcoin' ? '1' : coin.id === 'ethereum' ? '279' : '1'}/large/${coin.symbol.toLowerCase()}.png`} className="w-6 h-6 md:w-8 md:h-8" onError={(e) => (e.target as HTMLImageElement).style.display='none'} />
                       {coin.name} <span className="text-nexus-muted text-sm">#{coin.symbol}</span>
                    </h1>
                    <div className={`text-xs md:text-sm font-mono flex items-center gap-2 ${coin.change24h >= 0 ? 'text-nexus-success' : 'text-nexus-danger'}`}>
                       ${coin.price.toLocaleString()} ({coin.change24h > 0 ? '+' : ''}{coin.change24h.toFixed(2)}%)
                    </div>
                  </div>
               </div>
               
               <div className="flex bg-black/60 border border-white/10 rounded-xl p-1 w-full sm:w-auto shrink-0 shadow-inner">
                <button 
                  onClick={() => setActiveTab('chart')}
                  className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === 'chart' ? 'bg-white/10 text-white shadow-lg border border-white/5' : 'text-nexus-muted hover:text-gray-300 hover:bg-white/5'}`}
                >
                  Gráfico Pro
                </button>
                <button 
                  onClick={() => setActiveTab('dca')}
                  className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === 'dca' ? 'bg-nexus-accent text-white shadow-lg shadow-nexus-accent/20' : 'text-nexus-muted hover:text-gray-300 hover:bg-white/5'}`}
                >
                  Simulador DCA
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 relative bg-[#0b0e14] overflow-hidden group">
              {activeTab === 'chart' ? (
                <>
                  <div id="tradingview_widget" ref={containerRef} className="w-full h-full" />
                  
                  {/* TAOG Chart Overlay Indicator */}
                  <div className="absolute top-[10px] left-2 md:top-[80px] md:left-4 z-40 flex flex-col items-start pointer-events-none">
                     <div className="pointer-events-auto">
                        {!analysis ? (
                           <button 
                             onClick={handleAIAnalyze}
                             className="flex items-center gap-2 bg-nexus-black/80 backdrop-blur-md border border-white/10 hover:border-nexus-accent text-nexus-muted hover:text-white px-3 py-1.5 rounded-lg transition-all group shadow-lg"
                           >
                              {isAnalyzing ? (
                                <RefreshCw className="w-3 h-3 animate-spin text-nexus-accent" />
                              ) : (
                                <BrainCircuit className="w-3 h-3" />
                              )}
                              <span className="text-xs font-bold font-mono">TAOG v3.0 [OFFLINE]</span>
                           </button>
                        ) : isStructuredAnalysis(analysis) && (
                          <div className="flex flex-col items-start gap-2">
                             {/* Indicator Pill */}
                             <button 
                               onClick={() => setChartOverlayOpen(!chartOverlayOpen)}
                               className={`flex items-center gap-2 px-3 py-1.5 rounded-lg shadow-lg border backdrop-blur-xl transition-all ${
                                 analysis.verdict === 'COMPRA' ? 'bg-green-900/40 border-green-500/30 hover:bg-green-900/60' : 
                                 analysis.verdict === 'VENDA' ? 'bg-red-900/40 border-red-500/30 hover:bg-red-900/60' : 
                                 'bg-gray-800/40 border-gray-500/30'
                               }`}
                             >
                                <div className="relative flex items-center justify-center">
                                   <div className={`w-2 h-2 rounded-full ${
                                      analysis.verdict === 'COMPRA' ? 'bg-green-400' : analysis.verdict === 'VENDA' ? 'bg-red-400' : 'bg-gray-400'
                                   }`}></div>
                                   {/* Pulse effect */}
                                   <div className={`absolute w-2 h-2 rounded-full animate-ping opacity-75 ${
                                      analysis.verdict === 'COMPRA' ? 'bg-green-400' : analysis.verdict === 'VENDA' ? 'bg-red-400' : 'bg-gray-400'
                                   }`}></div>
                                </div>
                                <span className={`text-xs font-mono font-bold ${
                                   analysis.verdict === 'COMPRA' ? 'text-green-400' : analysis.verdict === 'VENDA' ? 'text-red-400' : 'text-gray-300'
                                }`}>TAOG: {analysis.verdict}</span>
                                {chartOverlayOpen ? <ChevronUp className="w-3 h-3 text-white/50" /> : <ChevronDown className="w-3 h-3 text-white/50" />}
                             </button>

                             {/* Expanded Summary Card */}
                             {chartOverlayOpen && (
                               <div className="mt-1 w-64 md:w-72 bg-nexus-black/95 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl animate-in fade-in slide-in-from-left-2">
                                  <div className="flex justify-between items-center mb-3">
                                     <span className="text-[10px] uppercase text-nexus-muted font-bold tracking-widest">Confiança Neural</span>
                                     <span className="text-white font-mono font-bold">{analysis.confidenceScore}%</span>
                                  </div>
                                  <div className="w-full h-1 bg-white/10 rounded-full mb-3 overflow-hidden">
                                     <div 
                                      className={`h-full ${analysis.verdict === 'COMPRA' ? 'bg-green-500' : analysis.verdict === 'VENDA' ? 'bg-red-500' : 'bg-gray-500'}`}
                                      style={{width: `${analysis.confidenceScore}%`}}
                                     ></div>
                                  </div>
                                  <p className="text-xs text-gray-300 leading-relaxed italic mb-3">
                                    "{analysis.executiveSummary}"
                                  </p>
                                  {(analysis.verdict === 'COMPRA' || analysis.verdict === 'VENDA') && (
                                    <button
                                      onClick={() => handleOrder(analysis.verdict === 'COMPRA' ? 'BUY' : 'SELL')}
                                      className={`w-full mt-3 py-2 rounded-lg text-xs font-bold text-white uppercase tracking-wider transition-colors shadow-lg flex items-center justify-center gap-2 ${
                                        analysis.verdict === 'COMPRA' ? 'bg-green-600 hover:bg-green-500 shadow-green-500/20' : 'bg-red-600 hover:bg-red-500 shadow-red-500/20'
                                      }`}
                                    >
                                      {analysis.verdict === 'COMPRA' ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                                      {analysis.verdict === 'COMPRA' ? 'Comprar Agora' : 'Vender Agora'}
                                    </button>
                                  )}
                               </div>
                             )}
                          </div>
                        )}
                     </div>
                  </div>
                </>
              ) : (
                <div className="h-full w-full flex flex-col md:flex-row animate-in fade-in duration-500">
                   {/* Left Panel: Optimized DCA Controls */}
                   <div className="w-full md:w-[360px] bg-[#131722] border-r border-white/5 p-6 flex flex-col gap-6 overflow-y-auto z-10 custom-scrollbar">
                      <div className="flex items-center justify-between">
                          <h3 className="text-white font-bold flex items-center gap-2 text-lg">
                              <Calculator className="w-5 h-5 text-nexus-accent" /> Parâmetros DCA
                          </h3>
                      </div>
                      
                      {/* 1. Contribution Amount */}
                      <div>
                        <label className="text-[10px] uppercase text-nexus-muted font-bold block mb-2 tracking-wider">Aporte Regular (USD)</label>
                        <div className="bg-[#0b0e14] border border-white/10 rounded-xl p-4 flex items-center gap-3 focus-within:border-nexus-accent transition-all group hover:border-white/20">
                          <div className="bg-nexus-success/10 p-2 rounded-lg text-nexus-success">
                             <DollarSign className="w-5 h-5" />
                          </div>
                          <input 
                            type="number" 
                            value={dcaAmount} 
                            onChange={(e) => setDcaAmount(Number(e.target.value))}
                            className="bg-transparent text-white font-mono w-full outline-none font-bold text-2xl placeholder-gray-700"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      {/* 2. Frequency */}
                      <div>
                        <label className="text-[10px] uppercase text-nexus-muted font-bold block mb-2 tracking-wider">Frequência</label>
                        <div className="grid grid-cols-2 gap-2">
                           {(['weekly', 'biweekly', 'monthly', 'quarterly'] as DCAFrequency[]).map(freq => (
                             <button
                               key={freq}
                               onClick={() => setDcaFrequency(freq)}
                               className={`py-3 px-2 text-[10px] uppercase font-bold rounded-xl border transition-all duration-200 ${
                                 dcaFrequency === freq 
                                 ? 'bg-nexus-accent text-white border-nexus-accent shadow-[0_0_15px_rgba(59,130,246,0.3)] transform scale-[1.02]' 
                                 : 'bg-[#0b0e14] border-white/5 text-nexus-muted hover:bg-white/5 hover:text-white'
                               }`}
                             >
                               {freq === 'weekly' ? 'Semanal' : freq === 'biweekly' ? 'Quinzenal' : freq === 'monthly' ? 'Mensal' : 'Trimestral'}
                             </button>
                           ))}
                        </div>
                      </div>

                      {/* 3. Duration */}
                      <div className="bg-[#0b0e14] border border-white/5 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-4">
                          <label className="text-[10px] uppercase text-nexus-muted font-bold tracking-wider flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5" /> Duração
                          </label>
                          <span className="text-xs font-bold text-nexus-accent bg-nexus-accent/10 px-3 py-1 rounded-full border border-nexus-accent/20">{dcaYears} Anos</span>
                        </div>
                        <input 
                          type="range" min="1" max="10" step="1" 
                          value={dcaYears}
                          onChange={(e) => setDcaYears(Number(e.target.value))}
                          className="w-full accent-nexus-accent h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer hover:bg-white/20 transition-colors"
                        />
                        <div className="flex justify-between text-[9px] text-nexus-muted mt-2 font-mono opacity-60">
                           <span>1 ANO</span>
                           <span>10 ANOS</span>
                        </div>
                      </div>

                      {/* 4. Profitability */}
                      <div className="bg-[#0b0e14] border border-white/5 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-3">
                          <label className="text-[10px] uppercase text-nexus-muted font-bold tracking-wider flex items-center gap-2">
                              <TrendingUp className="w-3.5 h-3.5" /> Projeção Anual (APY)
                          </label>
                          <div className="w-24 bg-[#131722] border border-white/10 rounded-lg flex items-center px-3 py-1.5 focus-within:border-nexus-accent transition-colors">
                              <input 
                                type="number" 
                                value={dcaTargetApy} 
                                onChange={(e) => setDcaTargetApy(Number(e.target.value))}
                                className="w-full bg-transparent text-right text-white font-bold text-sm outline-none"
                              />
                              <span className="text-nexus-muted text-xs ml-1 font-bold">%</span>
                          </div>
                        </div>
                        
                        {/* Suggestions */}
                        <div className="flex gap-2 mt-3">
                           {Object.entries(historicalStats).map(([period, value]) => (
                              <button 
                                key={period}
                                onClick={() => setDcaTargetApy(value)}
                                className="flex-1 py-1.5 text-[9px] uppercase font-bold text-nexus-muted bg-[#131722] border border-white/5 rounded hover:text-nexus-success hover:border-nexus-success/50 transition-colors"
                              >
                                  {period}: {value}%
                              </button>
                           ))}
                        </div>
                      </div>
                   </div>

                   {/* Right Panel: Visualization */}
                   <div className="flex-1 bg-[#0b0e14] p-6 flex flex-col min-h-0 relative">
                      {/* Top Summary Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                         <div className="bg-[#131722] border border-white/5 p-4 rounded-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                               <Wallet className="w-10 h-10 text-white" />
                            </div>
                            <div className="text-[10px] text-nexus-muted uppercase mb-1 tracking-widest font-bold">Total Investido</div>
                            <div className="text-xl md:text-2xl font-bold text-white font-mono tracking-tight">${totalInvested.toLocaleString()}</div>
                         </div>
                         
                         <div className="bg-gradient-to-br from-nexus-accent/10 to-[#131722] border border-nexus-accent/30 p-4 rounded-2xl relative overflow-hidden group">
                             <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-30 transition-opacity">
                               <Sparkles className="w-10 h-10 text-nexus-accent" />
                             </div>
                            <div className="text-[10px] text-nexus-accent uppercase mb-1 font-bold tracking-widest">Valor Final Estimado</div>
                            <div className="text-xl md:text-2xl font-bold text-white font-mono tracking-tight">${finalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                         </div>
                         
                         <div className={`bg-[#131722] border p-4 rounded-2xl relative overflow-hidden ${totalProfitPercent >= 0 ? 'border-green-500/20' : 'border-red-500/20'}`}>
                            <div className="text-[10px] text-nexus-muted uppercase mb-1 tracking-widest font-bold">Retorno Total</div>
                            <div className={`text-xl md:text-2xl font-bold font-mono tracking-tight ${totalProfitPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {totalProfitPercent >= 0 ? '+' : ''}{totalProfitPercent.toFixed(1)}%
                            </div>
                         </div>
                      </div>

                      {/* Chart Area */}
                      <div className="flex-1 bg-[#131722] border border-white/5 rounded-2xl p-4 relative shadow-inner flex flex-col min-h-[300px]">
                         {/* Internal Legend */}
                         <div className="flex justify-between items-center mb-4 px-2">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                               <Activity className="w-3 h-3 text-nexus-muted"/> Simulação de Patrimônio
                            </h4>
                            <div className="flex gap-4 text-[9px] uppercase font-bold text-nexus-muted">
                               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-nexus-muted/50"></div>Histórico Simulado</div>
                               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-nexus-accent"></div>Projeção</div>
                            </div>
                         </div>
                         
                         <div className="flex-1 w-full min-h-0">
                           <ResponsiveContainer width="100%" height="100%">
                              <ComposedChart data={dcaData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                
                                <XAxis 
                                  dataKey="period" 
                                  stroke="#333" 
                                  tickFormatter={(val) => val === 0 ? 'HOJE' : val % 12 === 0 ? `Ano ${val/12}` : ''} 
                                  tick={{fontSize: 10, fill: '#666', fontWeight: 'bold'}} 
                                  axisLine={false}
                                  height={20}
                                />
                                <YAxis 
                                  stroke="#333" 
                                  tickFormatter={(val) => `$${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`} 
                                  axisLine={false} 
                                  tick={{fontSize: 10, fill: '#666'}} 
                                  width={40}
                                />
                                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                
                                <Tooltip 
                                  contentStyle={{ backgroundColor: '#050505', borderColor: '#333', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                                  itemStyle={{ color: '#ccc' }}
                                  formatter={(value: number, name: string) => [
                                    `$${value.toLocaleString(undefined, {maximumFractionDigits:0})}`, 
                                    name === 'portfolioValue' ? 'Patrimônio' : name === 'totalInvested' ? 'Investido' : 'Compra'
                                  ]}
                                  labelFormatter={(period) => period < 0 ? 'Simulação Passada' : period > 0 ? `Mês ${period}` : 'Hoje'}
                                />

                                <ReferenceLine x={0} stroke="#fff" strokeDasharray="3 3" />
                                
                                <Area type="monotone" dataKey="portfolioValue" stroke="#3B82F6" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} activeDot={{r: 6, strokeWidth: 0, fill: '#fff'}} />
                                <Line type="step" dataKey="totalInvested" stroke="#555" strokeDasharray="3 3" dot={false} strokeWidth={2} />
                              </ComposedChart>
                           </ResponsiveContainer>
                         </div>
                      </div>
                   </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats Grid - 2x2 on Mobile */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel border border-white/10 p-4 md:p-5 rounded-2xl space-y-2 md:space-y-4">
               <div className="flex justify-between items-start">
                 <div className="text-nexus-muted text-[10px] uppercase font-bold tracking-widest">Market Cap</div>
                 <Activity className="w-4 h-4 text-nexus-muted" />
               </div>
               <div className="text-base md:text-xl font-bold text-white font-mono truncate">{formatLargeNumber(coin.marketCap)}</div>
               <div className="h-px bg-white/5 w-full"></div>
               <div className="flex flex-col md:flex-row justify-between text-xs gap-1">
                 <span className="text-nexus-muted">Vol 24h</span>
                 <span className="text-white font-mono">{formatLargeNumber(coin.volume24h)}</span>
               </div>
            </div>

            <div className="glass-panel border border-white/10 p-4 md:p-5 rounded-2xl space-y-2 md:space-y-4">
               <div className="flex justify-between items-start">
                 <div className="text-nexus-muted text-[10px] uppercase font-bold tracking-widest">FDV</div>
                 <div className="text-[10px] bg-white/5 px-1 rounded text-nexus-muted hidden sm:block">Diluído</div>
               </div>
               <div className="text-base md:text-xl font-bold text-white font-mono truncate">{formatLargeNumber(coin.fdv)}</div>
               <div className="h-px bg-white/5 w-full"></div>
               <div className="text-[10px] text-nexus-muted truncate">Valor teórico supply total.</div>
            </div>

            <div className="glass-panel border border-white/10 p-4 md:p-5 rounded-2xl space-y-2 md:space-y-4">
               <div className="flex justify-between items-start">
                 <div className="text-nexus-muted text-[10px] uppercase font-bold tracking-widest">Supply</div>
                 {coin.maxSupply && <Check className="w-4 h-4 text-nexus-success" />}
               </div>
               <div className="text-base md:text-lg font-bold text-white truncate font-mono">{formatLargeNumber(coin.circulatingSupply)}</div>
               <div className="w-full bg-black/50 rounded-full h-1.5 overflow-hidden">
                 <div className="bg-nexus-accent h-full shadow-[0_0_8px_#3B82F6]" style={{width: `${supplyProgress}%`}}></div>
               </div>
            </div>

             <div className="glass-panel border border-white/10 p-4 md:p-5 rounded-2xl space-y-2 md:space-y-4">
               <div className="flex justify-between items-start">
                 <div className="text-nexus-muted text-[10px] uppercase font-bold tracking-widest">ATH</div>
                 <BarChart3 className="w-4 h-4 text-nexus-muted" />
               </div>
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-1">
                  <span className="text-xs text-nexus-muted">Topo</span>
                  <div className="text-left md:text-right">
                    <div className="text-white font-mono font-bold text-sm md:text-base">${coin.ath?.toLocaleString()}</div>
                    <div className="text-[10px] text-nexus-danger">{coin.athChange?.toFixed(2)}%</div>
                  </div>
               </div>
               <div className="h-px bg-white/5 w-full"></div>
               <div className="flex justify-between items-center text-xs">
                  <span className="text-nexus-muted">Max 24h</span>
                  <span className="text-white font-mono">${coin.high24h?.toLocaleString()}</span>
               </div>
            </div>
          </div>
        </div>

        {/* Sidebar - TAOG V3 Analysis */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="glass-panel border border-white/10 rounded-3xl h-full flex flex-col shadow-2xl relative overflow-hidden min-h-[500px]">
            
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-nexus-dark relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.4)] border border-white/10">
                   <BrainCircuit className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg tracking-tight">Agente TAOG</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-nexus-success animate-pulse"></span>
                    <p className="text-[10px] text-nexus-muted uppercase tracking-wider font-semibold">Online • V 3.0</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto no-scrollbar bg-black/20">
              {!analysis ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-60">
                   <div className="relative">
                     <div className="absolute inset-0 bg-nexus-accent/20 blur-xl rounded-full animate-pulse-slow"></div>
                     <Zap className="w-16 h-16 text-nexus-border relative z-10" />
                   </div>
                   <div className="space-y-2">
                     <p className="text-white font-medium">Aguardando Comando...</p>
                     <p className="text-xs text-nexus-muted max-w-[200px] mx-auto leading-relaxed">
                       O TAOG está pronto para escanear estrutura, fluxo e confluências em H4, D1 e W1.
                     </p>
                   </div>
                </div>
              ) : isStructuredAnalysis(analysis) ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                   
                   {/* Verdict Card */}
                   <div className={`p-4 rounded-xl border relative overflow-hidden ${getStatusBg(analysis.verdict === 'COMPRA' ? 'BULLISH' : analysis.verdict === 'VENDA' ? 'BEARISH' : 'NEUTRAL')}`}>
                      <div className="relative z-10 flex justify-between items-start mb-2">
                         <span className="text-[10px] uppercase font-bold tracking-widest opacity-70">Veredito Global</span>
                         <span className="text-[10px] uppercase font-bold tracking-widest opacity-70">Confiança {analysis.confidenceScore}%</span>
                      </div>
                      <div className={`text-3xl font-bold tracking-tight mb-2 ${getStatusColor(analysis.verdict === 'COMPRA' ? 'BULLISH' : analysis.verdict === 'VENDA' ? 'BEARISH' : 'NEUTRAL')}`}>
                         {analysis.verdict}
                      </div>
                      <p className="text-xs text-white/80 leading-snug font-medium italic">
                         "{analysis.executiveSummary}"
                      </p>
                      {/* Confidence Bar */}
                      <div className="w-full h-1 bg-black/30 rounded-full mt-3 overflow-hidden">
                        <div 
                          className={`h-full ${analysis.verdict === 'COMPRA' ? 'bg-green-500' : analysis.verdict === 'VENDA' ? 'bg-red-500' : 'bg-gray-500'}`} 
                          style={{width: `${analysis.confidenceScore}%`}}
                        ></div>
                      </div>
                   </div>

                   {/* Multi-Timeframe Matrix */}
                   <div className="space-y-3">
                      <h4 className="text-xs uppercase text-nexus-muted font-bold tracking-wider flex items-center gap-2">
                         <Layers className="w-3 h-3"/> Matrix de Tempos Gráficos
                      </h4>
                      
                      <div className="grid grid-cols-1 gap-2">
                         {/* 4H */}
                         <div className="bg-white/5 p-3 rounded-lg border border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded bg-black/40 flex items-center justify-center text-xs font-bold text-nexus-muted border border-white/5">4H</div>
                               <div>
                                  <div className="text-xs font-bold text-white">Intraday</div>
                                  <div className={`text-[10px] font-bold ${getStatusColor(analysis.timeframeAnalysis.h4.status)}`}>{analysis.timeframeAnalysis.h4.status}</div>
                               </div>
                            </div>
                            <div className="text-right">
                               <div className="text-[10px] text-nexus-muted truncate max-w-[100px]">{analysis.timeframeAnalysis.h4.signal}</div>
                               <div className="text-[10px] text-white/60 font-mono">{analysis.timeframeAnalysis.h4.keyLevel}</div>
                            </div>
                         </div>

                         {/* 1D */}
                         <div className="bg-white/5 p-3 rounded-lg border border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded bg-black/40 flex items-center justify-center text-xs font-bold text-nexus-muted border border-white/5">1D</div>
                               <div>
                                  <div className="text-xs font-bold text-white">Swing</div>
                                  <div className={`text-[10px] font-bold ${getStatusColor(analysis.timeframeAnalysis.d1.status)}`}>{analysis.timeframeAnalysis.d1.status}</div>
                               </div>
                            </div>
                             <div className="text-right">
                               <div className="text-[10px] text-nexus-muted truncate max-w-[100px]">{analysis.timeframeAnalysis.d1.signal}</div>
                               <div className="text-[10px] text-white/60 font-mono">{analysis.timeframeAnalysis.d1.keyLevel}</div>
                            </div>
                         </div>

                         {/* 1W */}
                         <div className="bg-white/5 p-3 rounded-lg border border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded bg-black/40 flex items-center justify-center text-xs font-bold text-nexus-muted border border-white/5">1W</div>
                               <div>
                                  <div className="text-xs font-bold text-white">Macro</div>
                                  <div className={`text-[10px] font-bold ${getStatusColor(analysis.timeframeAnalysis.w1.status)}`}>{analysis.timeframeAnalysis.w1.status}</div>
                               </div>
                            </div>
                             <div className="text-right">
                               <div className="text-[10px] text-nexus-muted truncate max-w-[100px]">{analysis.timeframeAnalysis.w1.signal}</div>
                               <div className="text-[10px] text-white/60 font-mono">{analysis.timeframeAnalysis.w1.keyLevel}</div>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Detailed Reasoning */}
                   <div className="space-y-2">
                      <h4 className="text-xs uppercase text-nexus-muted font-bold tracking-wider flex items-center gap-2">
                         <Info className="w-3 h-3"/> Tese de Investimento
                      </h4>
                      <div className="text-xs text-gray-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5 text-justify">
                        {analysis.detailedReasoning}
                      </div>
                   </div>

                   {/* Key Levels */}
                   <div className="bg-black/40 p-4 rounded-xl border border-white/5 space-y-3">
                      <h4 className="text-xs uppercase text-nexus-muted font-bold tracking-wider flex items-center gap-2">
                         <Target className="w-3 h-3" /> Níveis de Execução
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                         <div className="bg-white/5 p-2 rounded border border-white/5">
                            <div className="text-nexus-muted text-[10px]">Entrada Ideal</div>
                            <div className="text-white font-mono">{analysis.levels.entryZone}</div>
                         </div>
                         <div className="bg-white/5 p-2 rounded border border-white/5">
                            <div className="text-nexus-muted text-[10px]">Stop Loss</div>
                            <div className="text-nexus-danger font-mono">{analysis.levels.stopLoss}</div>
                         </div>
                      </div>
                      <div className="bg-green-500/10 p-2 rounded border border-green-500/20">
                          <div className="text-green-500/70 text-[10px] uppercase font-bold">Alvos de Lucro</div>
                          <div className="text-green-400 font-mono text-xs">{analysis.levels.targets.join(' • ')}</div>
                      </div>
                   </div>
                   
                   {/* Risk Factor */}
                   <div className="flex items-start gap-2 bg-red-900/10 p-3 rounded-lg border border-red-900/30">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <div>
                         <div className="text-[10px] font-bold text-red-400 uppercase">Fator de Risco Principal</div>
                         <div className="text-xs text-red-200/80">{analysis.riskFactor}</div>
                      </div>
                   </div>

                </div>
              ) : (
                <div className="text-sm text-nexus-muted">{analysis as string}</div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t border-white/10 bg-nexus-dark z-10 space-y-3">
              {isStructuredAnalysis(analysis) && (analysis.verdict === 'COMPRA' || analysis.verdict === 'VENDA') && (
                <button
                  onClick={() => handleOrder(analysis.verdict === 'COMPRA' ? 'BUY' : 'SELL')}
                  className={`w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 animate-pulse ${
                    analysis.verdict === 'COMPRA' ? 'bg-nexus-success hover:bg-green-600 shadow-lg shadow-green-500/20' : 'bg-nexus-danger hover:bg-red-600 shadow-lg shadow-red-500/20'
                  }`}
                >
                   {analysis.verdict === 'COMPRA' ? <TrendingUp className="w-5 h-5" /> : <TrendingUp className="w-5 h-5 rotate-180" />}
                   {analysis.verdict === 'COMPRA' ? 'COMPRAR' : 'VENDER'}
                </button>
              )}

              <button 
                onClick={handleAIAnalyze}
                disabled={isAnalyzing}
                className="w-full bg-white/5 border border-white/10 text-white py-3 rounded-xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    Processando Dados (4H/1D/1W)...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-nexus-accent" /> {analysis ? 'RECALCULAR ESTRATÉGIA' : 'INICIAR ANÁLISE TAOG'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pro Execution Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
           <div className="bg-nexus-dark border border-white/10 rounded-3xl w-full max-w-lg p-0 relative shadow-2xl animate-in zoom-in duration-200 overflow-hidden">
             {/* Modal Header */}
             <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-lg ${orderType === 'BUY' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                      {orderType === 'BUY' ? <TrendingUp className="w-5 h-5" /> : <TrendingUp className="w-5 h-5 rotate-180" />}
                   </div>
                   <div>
                      <h3 className="text-xl font-bold text-white">{orderType === 'BUY' ? 'Comprar' : 'Vender'} {coin.symbol}</h3>
                      <p className="text-xs text-nexus-muted flex items-center gap-1">Preço Mercado: <span className="text-white font-mono">${coin.price.toLocaleString()}</span></p>
                   </div>
                </div>
                <button onClick={() => setShowOrderModal(false)} className="text-nexus-muted hover:text-white transition-colors">
                   <X className="w-6 h-6" />
                </button>
             </div>

             <div className="p-6 space-y-6">
                {/* Amount Input */}
                <div className="bg-black/40 rounded-xl p-4 border border-white/5 focus-within:border-nexus-accent transition-colors">
                   <div className="flex justify-between text-xs text-nexus-muted uppercase font-bold mb-2">
                      <span>Eu quero pagar</span>
                      <span>Disponível: $54,320.00</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="text-2xl text-nexus-muted font-light">$</span>
                      <input 
                        type="number" 
                        value={orderAmount}
                        onChange={(e) => setOrderAmount(Number(e.target.value))}
                        className="bg-transparent text-3xl font-mono text-white w-full outline-none font-bold"
                      />
                   </div>
                </div>

                {/* Percentage Slider (Visual) */}
                <div className="flex gap-2">
                   {[25, 50, 75, 100].map(pct => (
                      <button key={pct} onClick={() => setOrderAmount(54320 * (pct/100))} className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-nexus-muted hover:text-white transition-colors border border-white/5">
                         {pct}%
                      </button>
                   ))}
                </div>

                {/* Order Summary */}
                <div className="space-y-3 pt-2">
                   <div className="flex justify-between text-sm">
                      <span className="text-nexus-muted">Taxa de Rede (Est.)</span>
                      <span className="text-white font-mono">$1.50</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-nexus-muted">Total Recebido (Est.)</span>
                      <span className="text-white font-mono font-bold">~{(orderAmount / coin.price).toFixed(6)} {coin.symbol}</span>
                   </div>
                </div>

                {/* Confirm Button */}
                <button 
                  onClick={() => {
                    alert(`Ordem de ${orderType} enviada ao Livro de Ofertas!`);
                    setShowOrderModal(false);
                  }}
                  className={`w-full py-4 rounded-xl font-bold text-white text-lg transition-all shadow-lg flex items-center justify-center gap-2 group ${
                     orderType === 'BUY' ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-green-900/20' : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-red-900/20'
                  }`}
                >
                  <Wallet className="w-5 h-5 opacity-70 group-hover:scale-110 transition-transform" />
                  CONFIRMAR {orderType}
                </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};