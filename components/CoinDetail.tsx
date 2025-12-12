import React, { useEffect, useState, useRef } from 'react';
import { CoinData } from '../types';
import { ArrowLeft, Sparkles, BarChart3, DollarSign, BrainCircuit, Check, TrendingUp, X, Wallet, Clock, Activity, Target, ChevronDown, ChevronUp, RefreshCw, Zap, Calculator, Layers, AlertTriangle, Scale, Info } from 'lucide-react';
import { analyzeStrategy, TAOGAnalysis } from '../services/geminiService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line, ReferenceLine } from 'recharts';

interface CoinDetailProps {
  coin: CoinData;
  onBack: () => void;
}

interface DCASimulationPoint {
  period: number;
  label: string;
  totalInvested: number;
  portfolioValue: number;
  isPast: boolean; 
  buyPoint?: number;
  smaLevel?: number;
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
  const [dcaYears, setDcaYears] = useState<number>(5);
  const [dcaPastYears, setDcaPastYears] = useState<number>(1);
  const [dcaTargetApy, setDcaTargetApy] = useState<number>(45); 
  const [dcaFrequency, setDcaFrequency] = useState<DCAFrequency>('weekly'); // Default to weekly as per user strategy
  const [smartDcaEnabled, setSmartDcaEnabled] = useState<boolean>(true); // Default enabled
  const [dcaData, setDcaData] = useState<DCASimulationPoint[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'chart' && containerRef.current) {
      containerRef.current.innerHTML = '';
      const script = document.createElement('script');
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = () => {
        if (window.TradingView) {
          new window.TradingView.widget({
            autosize: true,
            symbol: `BINANCE:${coin.symbol}USDT`,
            interval: "W", // Default to Weekly for 8W SMA focus
            timezone: "Etc/UTC",
            theme: "dark",
            style: "1",
            locale: "br",
            toolbar_bg: "#f1f3f6",
            enable_publishing: false,
            allow_symbol_change: true,
            container_id: "tradingview_widget",
            // Add SMA 8W (approx length 8 on weekly)
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
        if (containerRef.current) containerRef.current.innerHTML = '';
      };
    }
  }, [activeTab, coin.symbol]);

  useEffect(() => {
    if (activeTab === 'dca') calculateDCA();
  }, [activeTab, dcaAmount, dcaYears, dcaTargetApy, dcaFrequency, coin.price, coin.symbol, smartDcaEnabled]);

  const calculateDCA = () => {
    let periodsPerYear = 12;
    if (dcaFrequency === 'weekly') periodsPerYear = 52;
    if (dcaFrequency === 'biweekly') periodsPerYear = 26;
    if (dcaFrequency === 'quarterly') periodsPerYear = 4;

    const futurePeriods = dcaYears * periodsPerYear;
    const pastPeriods = dcaPastYears * periodsPerYear;
    
    const data: DCASimulationPoint[] = [];
    
    let accumulatedInvested = 0;
    let accumulatedValue = 0;
    let currentSimPrice = coin.price;
    let currentSimSma = coin.sma8w;

    const volatility = coin.symbol === 'BTC' ? 0.04 : 0.08; 
    const historicalTrend = coin.symbol === 'BTC' ? 0.008 : 0.012;
    
    // Simulate Past
    for (let i = -pastPeriods; i <= 0; i++) {
        const randomMove = (Math.random() - 0.5) * volatility;
        const trendMove = historicalTrend * (12/periodsPerYear); 
        const periodReturn = 1 + randomMove + trendMove;
        
        let investmentThisPeriod = dcaAmount;
        
        if (smartDcaEnabled) {
           // USER STRATEGY: 8W SMA ACCUMULATION
           if (currentSimPrice < currentSimSma) {
               investmentThisPeriod = dcaAmount * 1.5; // Buy more below SMA
           } else if (currentSimPrice > currentSimSma * 1.3) {
               investmentThisPeriod = dcaAmount * 0.5; // Buy less when extended
           }
        }

        if (i === -pastPeriods) {
            accumulatedInvested = investmentThisPeriod;
            accumulatedValue = investmentThisPeriod;
        } else {
            accumulatedValue = (accumulatedValue * periodReturn) + investmentThisPeriod;
            accumulatedInvested += investmentThisPeriod;
            currentSimPrice = currentSimPrice * periodReturn;
            currentSimSma = currentSimSma * (1 + (trendMove * 0.8)); 
        }

        data.push({
            period: i,
            label: i === 0 ? 'HOJE' : `Period ${i}`,
            totalInvested: accumulatedInvested,
            portfolioValue: accumulatedValue,
            isPast: true,
            buyPoint: accumulatedValue,
            smaLevel: currentSimSma
        });
    }

    const ratePerPeriod = Math.pow(1 + (dcaTargetApy / 100), 1 / periodsPerYear) - 1;

    // Simulate Future
    for (let i = 1; i <= futurePeriods; i++) {
        let investmentThisPeriod = dcaAmount;
        if (smartDcaEnabled) {
           const isBearMarket = Math.random() > 0.6;
           if (isBearMarket) investmentThisPeriod = dcaAmount * 1.5;
           else investmentThisPeriod = dcaAmount;
        }
        
        accumulatedInvested += investmentThisPeriod;
        accumulatedValue = (accumulatedValue * (1 + ratePerPeriod)) + investmentThisPeriod;
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
      // Fallback handled in service
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOrder = (type: 'BUY' | 'SELL') => {
    setOrderType(type);
    setShowOrderModal(true);
  };

  const supplyProgress = coin.maxSupply ? (coin.circulatingSupply / coin.maxSupply) * 100 : 0;
  
  const finalDataPoint = dcaData[dcaData.length - 1];
  const finalValue = finalDataPoint?.portfolioValue || 0;
  const totalInvested = finalDataPoint?.totalInvested || 0;
  const totalProfitPercent = totalInvested > 0 ? ((finalValue - totalInvested) / totalInvested) * 100 : 0;

  const isStructuredAnalysis = (data: any): data is TAOGAnalysis => {
    return data && typeof data === 'object' && 'verdict' in data;
  };

  return (
    <div className="pt-24 px-4 md:px-6 max-w-[1600px] mx-auto min-h-screen pb-20">
      <button onClick={onBack} className="flex items-center text-nexus-muted hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Mercado
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        
        {/* Main Section */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          <div className="glass-panel border border-white/10 rounded-sm p-1 relative overflow-hidden h-[600px] md:h-[700px] flex flex-col shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-nexus-primary z-20 shadow-[0_0_15px_#00FF94]"></div>
            
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-nexus-surface z-10 border-b border-white/5 gap-4">
               <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="flex flex-col">
                    <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                       <img src={`https://assets.coingecko.com/coins/images/${coin.id === 'bitcoin' ? '1' : coin.id === 'ethereum' ? '279' : '1'}/large/${coin.symbol.toLowerCase()}.png`} className="w-6 h-6 md:w-8 md:h-8" onError={(e) => (e.target as HTMLImageElement).style.display='none'} />
                       {coin.name} <span className="text-nexus-muted text-sm">#{coin.symbol}</span>
                    </h1>
                    <div className={`text-xs md:text-sm font-mono flex items-center gap-2 ${coin.change24h >= 0 ? 'text-nexus-primary' : 'text-nexus-danger'}`}>
                       ${coin.price.toLocaleString()} ({coin.change24h > 0 ? '+' : ''}{coin.change24h.toFixed(2)}%)
                    </div>
                  </div>
               </div>
               
               <div className="flex bg-black/60 border border-white/10 rounded p-1 w-full sm:w-auto shrink-0 shadow-inner">
                <button 
                  onClick={() => setActiveTab('chart')}
                  className={`flex-1 sm:flex-none px-6 py-2 rounded text-sm font-bold transition-all duration-300 ${activeTab === 'chart' ? 'bg-white/10 text-white shadow-lg border border-white/5' : 'text-nexus-muted hover:text-gray-300 hover:bg-white/5'}`}
                >
                  Gráfico SMA 8W
                </button>
                <button 
                  onClick={() => setActiveTab('dca')}
                  className={`flex-1 sm:flex-none px-6 py-2 rounded text-sm font-bold transition-all duration-300 ${activeTab === 'dca' ? 'bg-nexus-primary text-black shadow-lg shadow-nexus-primary/20' : 'text-nexus-muted hover:text-gray-300 hover:bg-white/5'}`}
                >
                  DCA Estratégico
                </button>
              </div>
            </div>

            <div className="flex-1 relative bg-[#0b0e14] overflow-hidden group">
              {activeTab === 'chart' ? (
                <>
                  <div id="tradingview_widget" ref={containerRef} className="w-full h-full" />
                  
                  {/* AI Button Overlay */}
                  <div className="absolute top-[10px] left-2 md:top-[80px] md:left-4 z-40 flex flex-col items-start pointer-events-none">
                     <div className="pointer-events-auto">
                        {!analysis ? (
                           <button 
                             onClick={handleAIAnalyze}
                             className="flex items-center gap-2 bg-black/80 backdrop-blur-md border border-nexus-primary/30 hover:border-nexus-primary text-nexus-primary px-4 py-2 rounded transition-all group shadow-lg shadow-nexus-primary/10"
                           >
                              {isAnalyzing ? (
                                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                              ) : (
                                <Zap className="w-4 h-4 fill-current" />
                              )}
                              <span className="text-xs font-bold font-mono uppercase tracking-wider">Analisar Setup 8W</span>
                           </button>
                        ) : isStructuredAnalysis(analysis) && (
                          <div className="flex flex-col items-start gap-2">
                             <button 
                               onClick={() => setChartOverlayOpen(!chartOverlayOpen)}
                               className={`flex items-center gap-2 px-3 py-1.5 rounded shadow-lg border backdrop-blur-xl transition-all ${
                                 analysis.verdict === 'COMPRA' ? 'bg-green-900/80 border-green-500 text-green-400' : 
                                 analysis.verdict === 'VENDA' ? 'bg-red-900/80 border-red-500 text-red-400' : 
                                 'bg-gray-800/80 border-gray-500'
                               }`}
                             >
                                <span className="text-xs font-mono font-bold uppercase tracking-wider">TAOG: {analysis.verdict}</span>
                                {chartOverlayOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                             </button>

                             {chartOverlayOpen && (
                               <div className="mt-1 w-64 md:w-80 bg-black/95 backdrop-blur-xl border border-white/10 rounded-sm p-4 shadow-2xl animate-in fade-in slide-in-from-left-2">
                                  <div className="flex justify-between items-center mb-3">
                                     <span className="text-[10px] uppercase text-nexus-muted font-bold tracking-widest">Confiança</span>
                                     <span className="text-white font-mono font-bold">{analysis.confidenceScore}%</span>
                                  </div>
                                  <div className="w-full h-1 bg-white/10 rounded-full mb-3 overflow-hidden">
                                     <div 
                                      className={`h-full ${analysis.verdict === 'COMPRA' ? 'bg-nexus-primary' : analysis.verdict === 'VENDA' ? 'bg-nexus-danger' : 'bg-gray-500'}`}
                                      style={{width: `${analysis.confidenceScore}%`}}
                                     ></div>
                                  </div>
                                  <p className="text-xs text-gray-300 leading-relaxed italic mb-3">
                                    "{analysis.executiveSummary}"
                                  </p>
                                  {(analysis.verdict === 'COMPRA' || analysis.verdict === 'VENDA') && (
                                    <button
                                      onClick={() => handleOrder(analysis.verdict === 'COMPRA' ? 'BUY' : 'SELL')}
                                      className={`w-full mt-3 py-3 rounded font-bold text-black text-xs uppercase tracking-wider transition-colors shadow-lg flex items-center justify-center gap-2 ${
                                        analysis.verdict === 'COMPRA' ? 'bg-nexus-primary hover:bg-emerald-400' : 'bg-nexus-danger hover:bg-red-400'
                                      }`}
                                    >
                                      {analysis.verdict === 'COMPRA' ? <TrendingUp className="w-4 h-4" /> : <TrendingUp className="w-4 h-4 rotate-180" />}
                                      {analysis.verdict === 'COMPRA' ? 'Executar Compra' : 'Executar Venda'}
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
                   {/* DCA Sidebar */}
                   <div className="w-full md:w-[360px] bg-[#050505] border-r border-white/5 p-6 flex flex-col gap-6 overflow-y-auto z-10 custom-scrollbar">
                      <div className="flex items-center justify-between">
                          <h3 className="text-white font-bold flex items-center gap-2 text-lg">
                              <Calculator className="w-5 h-5 text-nexus-primary" /> Setup DCA
                          </h3>
                      </div>
                      
                      <div>
                        <label className="text-[10px] uppercase text-nexus-muted font-bold block mb-2 tracking-wider">Aporte Semanal (USD)</label>
                        <div className="bg-[#111] border border-white/10 rounded p-4 flex items-center gap-3 focus-within:border-nexus-primary transition-all">
                          <div className="text-nexus-primary">
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

                      <div className="bg-nexus-primary/5 border border-nexus-primary/20 rounded p-4 relative overflow-hidden">
                         <div className="flex justify-between items-center relative z-10">
                            <label className="flex items-center gap-2 text-xs font-bold text-white cursor-pointer select-none">
                               <input type="checkbox" checked={smartDcaEnabled} onChange={() => setSmartDcaEnabled(!smartDcaEnabled)} className="w-4 h-4 accent-nexus-primary rounded" />
                               Compra Inteligente (SMA 8W)
                            </label>
                            <BrainCircuit className="w-4 h-4 text-nexus-primary" />
                         </div>
                         <p className="text-[10px] text-nexus-muted mt-2 leading-relaxed relative z-10">
                            O algoritmo aumentará seus aportes quando o preço estiver <span className="text-white font-bold">abaixo da Média de 8 Semanas</span> e reduzirá quando estiver esticado.
                         </p>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase text-nexus-muted font-bold block mb-2 tracking-wider">Frequência</label>
                        <div className="grid grid-cols-2 gap-2">
                           {(['weekly', 'biweekly', 'monthly', 'quarterly'] as DCAFrequency[]).map(freq => (
                             <button
                               key={freq}
                               onClick={() => setDcaFrequency(freq)}
                               className={`py-3 px-2 text-[10px] uppercase font-bold rounded border transition-all duration-200 ${
                                 dcaFrequency === freq 
                                 ? 'bg-nexus-primary text-black border-nexus-primary' 
                                 : 'bg-[#111] border-white/5 text-nexus-muted hover:bg-white/5 hover:text-white'
                               }`}
                             >
                               {freq === 'weekly' ? 'Semanal' : freq === 'biweekly' ? 'Quinzenal' : freq === 'monthly' ? 'Mensal' : 'Trimestral'}
                             </button>
                           ))}
                        </div>
                      </div>
                   </div>

                   {/* DCA Chart Area */}
                   <div className="flex-1 bg-[#020202] p-6 flex flex-col min-h-0 relative">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                         <div className="bg-[#0A0A0A] border border-white/5 p-4 rounded relative overflow-hidden">
                            <div className="text-[10px] text-nexus-muted uppercase mb-1 tracking-widest font-bold">Total Investido</div>
                            <div className="text-xl md:text-2xl font-bold text-white font-mono tracking-tight">${totalInvested.toLocaleString()}</div>
                         </div>
                         
                         <div className="bg-[#0A0A0A] border border-nexus-primary/30 p-4 rounded relative overflow-hidden shadow-[0_0_15px_rgba(0,255,148,0.05)]">
                            <div className="text-[10px] text-nexus-primary uppercase mb-1 font-bold tracking-widest">Patrimônio Futuro</div>
                            <div className="text-xl md:text-2xl font-bold text-white font-mono tracking-tight">${finalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                         </div>
                         
                         <div className={`bg-[#0A0A0A] border p-4 rounded relative overflow-hidden ${totalProfitPercent >= 0 ? 'border-nexus-primary/20' : 'border-nexus-danger/20'}`}>
                            <div className="text-[10px] text-nexus-muted uppercase mb-1 tracking-widest font-bold">Lucro Líquido</div>
                            <div className={`text-xl md:text-2xl font-bold font-mono tracking-tight ${totalProfitPercent >= 0 ? 'text-nexus-primary' : 'text-nexus-danger'}`}>
                              {totalProfitPercent >= 0 ? '+' : ''}{totalProfitPercent.toFixed(1)}%
                            </div>
                         </div>
                      </div>

                      <div className="flex-1 bg-[#0A0A0A] border border-white/5 rounded p-4 relative shadow-inner flex flex-col min-h-[300px]">
                         <div className="flex-1 w-full min-h-0">
                           <ResponsiveContainer width="100%" height="100%">
                              <ComposedChart data={dcaData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00FF94" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#00FF94" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <XAxis 
                                  dataKey="period" stroke="#333" 
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
                                <CartesianGrid strokeDasharray="3 3" stroke="#111" vertical={false} />
                                <Tooltip 
                                  contentStyle={{ backgroundColor: '#000', borderColor: '#333', color: '#fff', fontSize: '12px' }}
                                  itemStyle={{ color: '#ccc' }}
                                  formatter={(value: number, name: string) => [
                                    `$${value.toLocaleString(undefined, {maximumFractionDigits:0})}`, 
                                    name === 'portfolioValue' ? 'Patrimônio' : 'Investido'
                                  ]}
                                />
                                <Area type="monotone" dataKey="portfolioValue" stroke="#00FF94" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} activeDot={{r: 6, strokeWidth: 0, fill: '#fff'}} />
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
        </div>

        {/* Right Sidebar - The "Brain" */}
        <div className="lg:col-span-4 xl:col-span-3">
          <div className="glass-panel border border-white/10 rounded-sm h-full flex flex-col shadow-2xl relative overflow-hidden min-h-[500px]">
            
            <div className="p-6 border-b border-white/10 bg-nexus-surface relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded bg-nexus-primary/10 flex items-center justify-center border border-nexus-primary/30">
                   <BrainCircuit className="w-6 h-6 text-nexus-primary" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg tracking-tight">Agente TAOG</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-nexus-primary animate-pulse"></span>
                    <p className="text-[10px] text-nexus-muted uppercase tracking-wider font-semibold">Online • V 3.0</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto no-scrollbar bg-black/20">
              {!analysis ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-60">
                   <Zap className="w-16 h-16 text-nexus-muted opacity-20" />
                   <p className="text-nexus-muted text-sm max-w-[200px] mx-auto leading-relaxed">
                     Pronto para analisar confluência de SMA 8W, S2F e Fibonacci.
                   </p>
                </div>
              ) : isStructuredAnalysis(analysis) ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                   {/* Verdict Card */}
                   <div className={`p-4 rounded border relative overflow-hidden ${analysis.verdict === 'COMPRA' ? 'bg-nexus-primary/10 border-nexus-primary/30' : analysis.verdict === 'VENDA' ? 'bg-nexus-danger/10 border-nexus-danger/30' : 'bg-white/5 border-white/10'}`}>
                      <div className="relative z-10 flex justify-between items-start mb-2">
                         <span className="text-[10px] uppercase font-bold tracking-widest opacity-70">Sinal Institucional</span>
                         <span className="text-[10px] uppercase font-bold tracking-widest opacity-70">{analysis.confidenceScore}% Confiança</span>
                      </div>
                      <div className={`text-3xl font-bold tracking-tight mb-2 ${analysis.verdict === 'COMPRA' ? 'text-nexus-primary' : analysis.verdict === 'VENDA' ? 'text-nexus-danger' : 'text-gray-400'}`}>
                         {analysis.verdict}
                      </div>
                      <p className="text-xs text-white/80 leading-snug font-medium italic">"{analysis.executiveSummary}"</p>
                   </div>
                   
                   {/* Reasoning */}
                   <div className="bg-white/5 p-4 rounded border border-white/5">
                      <h4 className="text-[10px] uppercase text-nexus-muted font-bold tracking-wider mb-2">Análise Tática</h4>
                      <p className="text-xs text-gray-300 leading-relaxed text-justify">{analysis.detailedReasoning}</p>
                   </div>
                   
                   {/* Levels */}
                   <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                         <span className="text-nexus-muted uppercase font-bold">Stop Loss</span>
                         <span className="text-nexus-danger font-mono font-bold">{analysis.levels.stopLoss}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                         <span className="text-nexus-muted uppercase font-bold">Entrada</span>
                         <span className="text-white font-mono font-bold">{analysis.levels.entryZone}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                         <span className="text-nexus-muted uppercase font-bold">Alvo</span>
                         <span className="text-nexus-primary font-mono font-bold">{analysis.levels.targets[0]}</span>
                      </div>
                   </div>
                </div>
              ) : (
                <div className="text-sm text-nexus-muted">{analysis as string}</div>
              )}
            </div>

            <div className="p-4 border-t border-white/10 bg-nexus-surface z-10">
               <button 
                onClick={handleAIAnalyze}
                disabled={isAnalyzing}
                className="w-full bg-nexus-primary hover:bg-emerald-400 text-black py-4 rounded font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_0_20px_rgba(0,255,148,0.2)]"
              >
                {isAnalyzing ? (
                  <>Processando Dados...</>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current" /> GERAR SINAL ALPHA
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Order Modal... (Keep existing but style updates handled by global CSS) */}
    </div>
  );
};