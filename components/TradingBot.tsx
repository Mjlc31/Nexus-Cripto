import React, { useState, useEffect, useRef } from 'react';
import { Bot, Power, Activity, Terminal, ShieldCheck, Zap, TrendingUp, DollarSign, BrainCircuit, Lock, CreditCard, ChevronRight, AlertTriangle, PlayCircle, StopCircle, Target, X, Cpu, Wallet, Network, Wifi, Layers, Crosshair, BarChart3, RefreshCcw, Bell } from 'lucide-react';
import { BotConfig, BotLog, TradeSignal, ActivePosition } from '../types';
import { storageService } from '../services/storageService';
import { dbService } from '../services/database';

// Interfaces locais para UI avançada
interface StrategyMetric {
  name: string;
  active: boolean;
  confidence: number; // 0-100
  description: string;
}

interface PerformanceMetrics {
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  netPnl: number;
}

// Toast Notification Component - Modernized
const ToastNotification = ({ message, type, onClose }: { message: string, type: string, onClose: () => void }) => (
  <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl backdrop-blur-2xl bg-black/60 border border-white/10 flex items-center gap-4 animate-in slide-in-from-right-10 duration-500 cursor-pointer hover:bg-black/70 transition-colors max-w-sm" onClick={onClose}>
    <div className={`p-2 rounded-full shrink-0 ${type === 'SIGNAL' ? 'bg-nexus-accent text-white' : 'bg-white/10 text-white'}`}>
      {type === 'SIGNAL' ? <Crosshair className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
    </div>
    <div>
      <div className="font-bold text-white text-xs uppercase tracking-wide opacity-80 mb-0.5">{type === 'SIGNAL' ? 'Sinal Algorítmico' : 'Sistema'}</div>
      <div className="text-sm text-white font-medium">{message}</div>
    </div>
  </div>
);

export const TradingBot: React.FC = () => {
  const [hasLicense, setHasLicense] = useState(storageService.hasBotLicense());
  const [config, setConfig] = useState<BotConfig>(storageService.getBotConfig());
  const [logs, setLogs] = useState<BotLog[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  
  // ASTER System State
  const [walletBalance, setWalletBalance] = useState(54320.50); 
  const [asterStatus, setAsterStatus] = useState<'IDLE' | 'SCANNING' | 'ANALYZING' | 'EXECUTING'>('IDLE');
  const [networkLatency, setNetworkLatency] = useState(12);
  const [notification, setNotification] = useState<{msg: string, type: string} | null>(null);
  
  // Metrics State
  const [performance, setPerformance] = useState<PerformanceMetrics>({
    totalTrades: 324,
    winRate: 72.4,
    profitFactor: 2.8,
    netPnl: 12450.00
  });

  // Visual Confluence State (Sync with User Strategy)
  const [strategies, setStrategies] = useState<StrategyMetric[]>([
    { name: 'SMA 8-Semanas', active: true, confidence: 0, description: 'Tendência Primária' },
    { name: 'Stock-to-Flow', active: true, confidence: 0, description: 'Modelo de Escassez' },
    { name: 'Fibonacci Aureo', active: false, confidence: 0, description: 'Retrações' },
    { name: 'Order Flow (HFT)', active: true, confidence: 0, description: 'Pressão de Compra' },
  ]);

  // Interaction State
  const [pendingSignal, setPendingSignal] = useState<TradeSignal | null>(null);
  const [activePosition, setActivePosition] = useState<ActivePosition | null>(null);
  const [isProcessingBuy, setIsProcessingBuy] = useState(false);

  // Initial Load from IndexedDB
  useEffect(() => {
    const loadData = async () => {
        const historyLogs = await dbService.getLogs(50);
        if (historyLogs.length > 0) setLogs(historyLogs);
        
        // Check for active trades in DB (Persistence)
        const activeTrades = await dbService.getTrades();
        if (activeTrades.length > 0) setActivePosition(activeTrades[0]);
    };
    loadData();
  }, []);

  // Save config changes
  useEffect(() => {
    storageService.saveBotConfig(config);
    // Visual update of strategy list based on config
    setStrategies(prev => prev.map(s => {
        if(s.name.includes('SMA')) return {...s, active: config.strategies.sma8w};
        if(s.name.includes('Stock')) return {...s, active: config.strategies.s2f};
        if(s.name.includes('Fibonacci')) return {...s, active: config.strategies.fibbo};
        return s;
    }));
  }, [config]);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Handle License Purchase
  const handlePurchase = () => {
    setIsProcessingBuy(true);
    setTimeout(() => {
      storageService.buyBotLicense();
      setHasLicense(true);
      setIsProcessingBuy(false);
    }, 2000);
  };

  const showToast = (msg: string, type: 'INFO' | 'SIGNAL') => {
      setNotification({ msg, type });
      setTimeout(() => setNotification(null), 5000);
  };

  // --- ENGINE LOGIC: INCANSÁVEL ---
  useEffect(() => {
    let interval: any;
    let visualInterval: any;

    if (config.isActive && hasLicense) {
      if (logs.length === 0) {
        addLog('INFO', 'ASTER Engine v3.0 iniciado. Conectado ao banco de dados interno.');
        setAsterStatus('SCANNING');
      }
      
      // 1. High Frequency Visual Updates
      visualInterval = setInterval(() => {
         setNetworkLatency(prev => Math.max(8, Math.min(35, prev + (Math.random() * 6 - 3))));
         // Fluctuate confidence based on market "noise"
         setStrategies(prev => prev.map(s => ({
            ...s,
            confidence: s.active ? Math.min(99, Math.max(15, s.confidence + (Math.random() * 30 - 15))) : 0
         })));
      }, 800);

      // 2. Logic & Execution Loop
      interval = setInterval(() => {
        // If we have a pending signal or active position, reduce scan chatter
        if (pendingSignal || activePosition) {
           if (Math.random() > 0.7) {
             if (activePosition) updateActivePosition();
             else if (pendingSignal && !config.autoExecute) {
                // Reminder notification if manual approval needed
                if(Math.random() > 0.8) showToast(`Aguardando autorização para ${pendingSignal.direction} em ${pendingSignal.asset}`, 'SIGNAL');
             }
           }
           return;
        }

        // --- SCANNING LOGIC ---
        const random = Math.random();
        
        if (random > 0.90) { 
           // FOUND OPPORTUNITY
           setAsterStatus('ANALYZING');
           setTimeout(generateSignal, 1000); 
        } else {
           setAsterStatus('SCANNING');
           
           // Generate Tech-Specific Logs based on User Strategy
           const actions = [
            () => addLog('INFO', `Varredura de bloco completa. Latência: ${Math.floor(networkLatency)}ms`),
            () => {
                if (config.strategies.sma8w) addLog('INFO', 'SMA 8-Semanas: Validando tendência primária em BTC/ETH...');
            },
            () => {
                if (config.strategies.s2f) addLog('INFO', `Modelo S2F: Desvio atual -0.4. Ativo subvalorizado.`);
            },
            () => {
                if (config.strategies.fibbo) addLog('INFO', 'Fibonacci: Preço testando retração de 0.618 (Golden Pocket).');
            },
            () => addLog('INFO', `Order Flow: Delta de volume positivo. Pressão institucional detectada.`),
            () => addLog('WARNING', 'Volatilidade aumentando. Recalculando tamanho de posição...'),
          ];
          
          // Execute a relevant log function
          const validActions = actions.filter(a => {
              // Simple filter to ensure we don't log disabled strategies too often (imperfect but functional simulation)
              return true; 
          });
          
          const randomAction = validActions[Math.floor(Math.random() * validActions.length)];
          randomAction();
        }

      }, 2000); // 2 seconds tick
    } else {
      setAsterStatus('IDLE');
    }

    return () => {
      clearInterval(interval);
      clearInterval(visualInterval);
    };
  }, [config.isActive, hasLicense, pendingSignal, activePosition, networkLatency, config.strategies, config.autoExecute]);

  const addLog = async (type: BotLog['type'], message: string, asset?: string) => {
    const newLog: BotLog = {
      id: Date.now().toString() + Math.random(),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour12: false }) + '.' + Math.floor(Math.random()*999),
      type,
      message,
      asset
    };
    
    // Optimistic UI Update
    setLogs(prev => [...prev.slice(-99), newLog]); // Keep last 100 in UI
    
    // Async DB Save
    await dbService.addLog(newLog);
  };

  const setRiskProfile = (profile: 'CONSERVATIVE' | 'BALANCED' | 'DEGEN') => {
    let newConfig = { ...config };
    if (profile === 'CONSERVATIVE') {
      newConfig.leverage = 2;
      newConfig.maxAllocationPerTrade = 500.00;
      addLog('INFO', 'Perfil de risco ajustado: CONSERVADOR (2x)');
    } else if (profile === 'BALANCED') {
      newConfig.leverage = 10;
      newConfig.maxAllocationPerTrade = 2000.00;
      addLog('INFO', 'Perfil de risco ajustado: BALANCEADO (10x)');
    } else {
      newConfig.leverage = 50;
      newConfig.maxAllocationPerTrade = 5000.00;
      addLog('WARNING', 'Perfil de risco ajustado: DEGEN (50x). CUIDADO.');
    }
    setConfig(newConfig);
  };

  const generateSignal = () => {
    const asset = Math.random() > 0.4 ? 'BTC' : 'ETH';
    const direction = Math.random() > 0.5 ? 'LONG' : 'SHORT';
    const currentPrice = asset === 'BTC' ? 96420.50 : 2750.20;
    
    // Check balance
    if (walletBalance < config.maxAllocationPerTrade) {
        addLog('WARNING', `FALHA NA EXECUÇÃO: Saldo insuficiente ($${walletBalance.toFixed(2)}).`);
        setAsterStatus('SCANNING');
        return;
    }

    const signal: TradeSignal = {
      id: Date.now().toString(),
      asset,
      direction,
      leverage: config.leverage,
      entryPrice: currentPrice,
      stopLoss: direction === 'LONG' ? currentPrice * 0.985 : currentPrice * 1.015,
      takeProfit: direction === 'LONG' ? currentPrice * 1.03 : currentPrice * 0.97,
      confidence: 85 + Math.floor(Math.random() * 14),
      reason: 'Confluência TAOG: SMA 8W + Divergência Bullish',
      timestamp: Date.now()
    };

    setPendingSignal(signal);
    addLog('SIGNAL', `ALVO DETECTADO: ${direction} ${asset}. Prob: ${signal.confidence}%.`, asset);
    
    // Notify User
    showToast(`${direction} ${asset} detectado! Confiança: ${signal.confidence}%`, 'SIGNAL');

    // Auto Execution Logic
    if (config.autoExecute) {
        addLog('INFO', 'Auto-Execução ativada. Iniciando ordem em 3s...', asset);
        setTimeout(() => authorizeTrade(signal), 3000);
    } else {
        setAsterStatus('ANALYZING'); // Waiting for user
    }
  };

  const authorizeTrade = async (signalOverride?: TradeSignal) => {
    const signalToUse = signalOverride || pendingSignal;
    if (!signalToUse) return;
    
    setWalletBalance(prev => prev - config.maxAllocationPerTrade);

    addLog('SUCCESS', `ORDEM EXECUTADA: ${signalToUse.direction} ${signalToUse.asset} @ ${signalToUse.entryPrice.toFixed(2)}`, signalToUse.asset);
    
    const position: ActivePosition = {
      id: signalToUse.id,
      asset: signalToUse.asset,
      direction: signalToUse.direction,
      leverage: signalToUse.leverage,
      entryPrice: signalToUse.entryPrice,
      currentPrice: signalToUse.entryPrice,
      margin: config.maxAllocationPerTrade,
      pnlUsd: 0,
      pnlPercent: 0,
      liquidationPrice: signalToUse.direction === 'LONG' 
        ? signalToUse.entryPrice * (1 - (1/signalToUse.leverage)) 
        : signalToUse.entryPrice * (1 + (1/signalToUse.leverage))
    };

    setActivePosition(position);
    setPendingSignal(null);
    setAsterStatus('EXECUTING');
    
    // Persist Trade
    await dbService.saveTrade(position);
  };

  const rejectTrade = () => {
    addLog('WARNING', 'Sinal rejeitado pelo operador.', pendingSignal?.asset);
    setPendingSignal(null);
    setAsterStatus('SCANNING');
  };

  const updateActivePosition = () => {
    if (!activePosition) return;
    
    const volatility = activePosition.asset === 'BTC' ? 0.0005 : 0.001;
    const change = (Math.random() * volatility * 4) - (volatility * 1.5); 
    const newPrice = activePosition.currentPrice * (1 + change);
    
    const priceMovePct = (newPrice - activePosition.entryPrice) / activePosition.entryPrice;
    const rawPnlPct = activePosition.direction === 'LONG' ? priceMovePct : -priceMovePct;
    const leveragedPnlPct = rawPnlPct * activePosition.leverage;
    
    const pnlUsd = activePosition.margin * leveragedPnlPct;

    setActivePosition(prev => prev ? ({
      ...prev,
      currentPrice: newPrice,
      pnlPercent: leveragedPnlPct * 100,
      pnlUsd: pnlUsd
    }) : null);
  };

  const closePosition = () => {
    if (!activePosition) return;
    
    const finalAmount = activePosition.margin + activePosition.pnlUsd;
    setWalletBalance(prev => prev + finalAmount);
    
    // Update stats
    setPerformance(prev => ({
        ...prev,
        totalTrades: prev.totalTrades + 1,
        netPnl: prev.netPnl + activePosition.pnlUsd,
        winRate: activePosition.pnlUsd > 0 ? ((prev.winRate * prev.totalTrades + 100) / (prev.totalTrades + 1)) : ((prev.winRate * prev.totalTrades) / (prev.totalTrades + 1))
    }));

    addLog(activePosition.pnlUsd >= 0 ? 'SUCCESS' : 'WARNING', `POSIÇÃO ENCERRADA. Retorno: $${finalAmount.toFixed(2)} (P&L: ${activePosition.pnlUsd >= 0 ? '+' : ''}${activePosition.pnlUsd.toFixed(2)})`, activePosition.asset);
    setActivePosition(null);
    setAsterStatus('SCANNING');
  };

  if (!hasLicense) {
    return (
      <div className="pt-24 px-4 min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="relative z-10 w-full max-w-lg glass-panel rounded-3xl p-10 text-center shadow-2xl mx-4">
           <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
             <Lock className="w-6 h-6 text-nexus-accent" />
           </div>
           <h1 className="text-3xl font-bold text-white tracking-tight mb-3">Nexus Bot AI</h1>
           <p className="text-nexus-muted text-sm leading-relaxed mb-8">
             O algoritmo institucional requer uma chave de licença ativa. Acesso a estratégias HFT, execução automática e gestão de risco avançada.
           </p>
           <button onClick={handlePurchase} disabled={isProcessingBuy} className="w-full bg-white text-black hover:bg-gray-200 py-4 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50">
             {isProcessingBuy ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : <><CreditCard className="w-4 h-4" /> Adquirir Licença ($1,000)</>}
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 px-4 md:px-8 max-w-[1600px] mx-auto min-h-screen pb-20">
      
      {/* Toast Notification */}
      {notification && (
        <ToastNotification message={notification.msg} type={notification.type} onClose={() => setNotification(null)} />
      )}

      {/* Header HUD */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
         <div>
            <h2 className="text-3xl font-bold text-white tracking-tight mb-1">Nexus Bot <span className="text-nexus-muted font-normal">Control</span></h2>
            <div className="flex items-center gap-2">
               <span className={`w-2 h-2 rounded-full ${config.isActive ? 'bg-nexus-success animate-pulse' : 'bg-red-500'}`}></span>
               <span className="text-xs font-mono text-nexus-muted uppercase">{config.isActive ? 'Sistema Online' : 'Sistema Pausado'}</span>
            </div>
         </div>
         <div className="flex gap-4">
             <MetricBadge label="Win Rate" value={`${performance.winRate.toFixed(1)}%`} />
             <MetricBadge label="Profit Factor" value={`${performance.profitFactor}x`} />
             <MetricBadge label="Banca" value={`$${walletBalance.toFixed(2)}`} highlight />
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        
        {/* Left Column: Configuration (3 Cols) */}
        <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
           {/* Master Switch */}
           <button 
             onClick={() => setConfig(prev => ({ ...prev, isActive: !prev.isActive }))}
             className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 border border-white/5 ${
               config.isActive 
               ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20' 
               : 'bg-nexus-success/10 text-nexus-success border-nexus-success/20 hover:bg-nexus-success/20'
             }`}
           >
             <Power className="w-4 h-4" /> {config.isActive ? 'PARAR SISTEMA' : 'INICIAR BOT'}
           </button>

           {/* Settings Card */}
           <div className="glass-panel rounded-3xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-nexus-muted" />
                    <div>
                       <div className="text-sm font-medium text-white">Auto-Execução</div>
                       <div className="text-[10px] text-nexus-muted">Ordens sem confirmação</div>
                    </div>
                 </div>
                 <Switch checked={config.autoExecute} onChange={() => setConfig({...config, autoExecute: !config.autoExecute})} />
              </div>

              <div className="h-px bg-white/5"></div>

              <div>
                 <div className="flex justify-between items-center mb-4">
                    <div className="text-xs font-bold text-nexus-muted uppercase tracking-wider">Risco</div>
                    <div className="text-xs font-mono text-nexus-accent">{config.leverage}x</div>
                 </div>
                 <div className="space-y-2">
                    {['CONSERVATIVE', 'BALANCED', 'DEGEN'].map((profile) => (
                       <button 
                         key={profile}
                         onClick={() => setRiskProfile(profile as any)}
                         className={`w-full text-left p-3 rounded-xl text-xs font-medium border transition-all ${
                            (profile === 'CONSERVATIVE' && config.leverage <= 3) || 
                            (profile === 'BALANCED' && config.leverage > 3 && config.leverage <= 20) ||
                            (profile === 'DEGEN' && config.leverage > 20)
                            ? 'bg-white/10 border-white/20 text-white' 
                            : 'bg-transparent border-transparent text-nexus-muted hover:bg-white/5'
                         }`}
                       >
                          {profile === 'CONSERVATIVE' && 'Conservador (2x)'}
                          {profile === 'BALANCED' && 'Balanceado (10x)'}
                          {profile === 'DEGEN' && 'Agressivo (50x)'}
                       </button>
                    ))}
                 </div>
              </div>
           </div>

           {/* Strategies */}
           <div className="glass-panel rounded-3xl p-6">
              <h3 className="text-xs font-bold text-nexus-muted uppercase tracking-wider mb-4">Confluência</h3>
              <div className="space-y-4">
                 {strategies.map((strat, idx) => (
                    <div key={idx} className="flex flex-col gap-1">
                       <div className="flex justify-between items-center text-xs">
                          <span className={strat.active ? 'text-white' : 'text-gray-600'}>{strat.name}</span>
                          <span className="font-mono text-nexus-accent">{strat.confidence.toFixed(0)}%</span>
                       </div>
                       <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${strat.active ? 'bg-nexus-accent' : 'bg-transparent'}`} 
                            style={{width: `${strat.confidence}%`}}
                          ></div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Middle Column: Visualizer (6 Cols) */}
        <div className="lg:col-span-6 order-1 lg:order-2">
           <div className="glass-panel rounded-3xl h-[500px] lg:h-full relative overflow-hidden flex flex-col items-center justify-center p-8 border border-white/10">
              
              {/* Background Grid */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
              
              {pendingSignal ? (
                 <div className="relative z-10 w-full max-w-md bg-black/40 backdrop-blur-xl border border-nexus-accent/30 rounded-3xl p-8 animate-in zoom-in duration-300">
                    <div className="flex justify-between items-start mb-8">
                       <div>
                          <h2 className="text-2xl font-bold text-white tracking-tight">Sinal Detectado</h2>
                          <div className="flex items-center gap-2 mt-1">
                             <span className="w-2 h-2 rounded-full bg-nexus-accent animate-pulse"></span>
                             <span className="text-xs text-nexus-accent font-mono uppercase">Alta Confiança</span>
                          </div>
                       </div>
                       <div className="text-4xl font-mono font-bold text-white tracking-tighter">{pendingSignal.confidence}%</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                       <div className="bg-white/5 rounded-2xl p-4">
                          <div className="text-xs text-nexus-muted uppercase mb-1">Ativo</div>
                          <div className="text-lg font-bold text-white flex items-center gap-2">
                             {pendingSignal.asset}
                             <span className={`text-[10px] px-2 py-0.5 rounded-full ${pendingSignal.direction === 'LONG' ? 'bg-nexus-success/20 text-nexus-success' : 'bg-nexus-danger/20 text-nexus-danger'}`}>
                                {pendingSignal.direction}
                             </span>
                          </div>
                       </div>
                       <div className="bg-white/5 rounded-2xl p-4">
                          <div className="text-xs text-nexus-muted uppercase mb-1">Entrada</div>
                          <div className="text-lg font-bold text-white font-mono">${pendingSignal.entryPrice.toFixed(2)}</div>
                       </div>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={rejectTrade} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-nexus-muted hover:text-white rounded-xl font-bold transition-colors text-sm">Ignorar</button>
                        <button onClick={() => authorizeTrade()} className="flex-[2] py-3 bg-nexus-accent hover:bg-blue-600 text-white rounded-xl font-bold transition-colors shadow-lg shadow-nexus-accent/20 text-sm">
                            Executar
                        </button>
                    </div>
                 </div>
              ) : activePosition ? (
                 <div className="relative z-10 w-full max-w-md bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col justify-between h-[300px]">
                    <div className="flex justify-between items-center">
                       <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full animate-pulse ${activePosition.direction === 'LONG' ? 'bg-nexus-success' : 'bg-nexus-danger'}`}></div>
                          <div>
                             <div className="text-white font-bold text-lg">{activePosition.asset} PERP</div>
                             <div className="text-xs text-nexus-muted font-mono">{activePosition.direction} {activePosition.leverage}x</div>
                          </div>
                       </div>
                       <div className={`text-2xl font-mono font-bold tracking-tight ${activePosition.pnlPercent >= 0 ? 'text-nexus-success' : 'text-nexus-danger'}`}>
                          {activePosition.pnlPercent >= 0 ? '+' : ''}{activePosition.pnlPercent.toFixed(2)}%
                       </div>
                    </div>

                    <div className="flex justify-center py-6">
                        <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center ${activePosition.pnlPercent >= 0 ? 'border-nexus-success/30 text-nexus-success' : 'border-nexus-danger/30 text-nexus-danger'}`}>
                           <div className="text-center">
                              <div className="text-[10px] uppercase text-nexus-muted">PNL (USD)</div>
                              <div className="font-mono font-bold text-lg">${activePosition.pnlUsd.toFixed(2)}</div>
                           </div>
                        </div>
                    </div>

                    <button onClick={closePosition} className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 text-white rounded-xl font-medium transition-all text-sm">
                       Encerrar Posição
                    </button>
                 </div>
              ) : (
                 <div className="relative z-10 text-center space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-white/5 flex items-center justify-center relative">
                        {config.isActive && (
                            <>
                                <div className="absolute inset-0 rounded-full border border-nexus-accent/30 animate-[ping_2s_linear_infinite]"></div>
                                <div className="absolute inset-0 rounded-full border border-nexus-accent/20 animate-[ping_2s_linear_infinite_1s]"></div>
                            </>
                        )}
                        <Activity className={`w-8 h-8 ${config.isActive ? 'text-nexus-accent' : 'text-nexus-muted'}`} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-tight">{config.isActive ? 'Monitorando Mercado' : 'Em Espera'}</h3>
                        <p className="text-sm text-nexus-muted font-light">
                            {config.isActive ? 'Algoritmo buscando padrões de alta probabilidade.' : 'Inicie o bot para começar.'}
                        </p>
                    </div>
                 </div>
              )}
           </div>
        </div>

        {/* Right Column: Logs (3 Cols) */}
        <div className="lg:col-span-3 order-3 lg:order-3">
           <div className="glass-panel rounded-3xl h-64 lg:h-full flex flex-col overflow-hidden">
              <div className="p-4 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                 <span className="text-xs font-bold text-nexus-muted uppercase tracking-wider">System Logs</span>
                 <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-white/10"></div>
                    <div className="w-2 h-2 rounded-full bg-white/10"></div>
                 </div>
              </div>
              <div className="flex-1 p-4 overflow-y-auto font-mono text-[10px] space-y-2 scrollbar-thin">
                 {logs.map((log) => (
                    <div key={log.id} className="flex gap-2 opacity-80 hover:opacity-100 transition-opacity">
                       <span className="text-nexus-muted select-none">{log.timestamp.split(' ')[0]}</span>
                       <div>
                          <span className={`font-bold mr-1 ${
                             log.type === 'INFO' ? 'text-blue-400' : 
                             log.type === 'SUCCESS' ? 'text-green-400' : 
                             log.type === 'WARNING' ? 'text-yellow-400' : 
                             log.type === 'SIGNAL' ? 'text-purple-400' :
                             'text-red-500'
                          }`}>{log.type}</span>
                          <span className="text-gray-300">{log.message}</span>
                       </div>
                    </div>
                 ))}
                 <div ref={logsEndRef}></div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

const MetricBadge = ({ label, value, highlight }: {label: string, value: string, highlight?: boolean}) => (
    <div className={`px-4 py-2 rounded-xl border flex flex-col items-center justify-center min-w-[100px] backdrop-blur-md ${highlight ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/5'}`}>
        <span className="text-[10px] uppercase tracking-wider text-nexus-muted font-bold">{label}</span>
        <span className="text-lg font-mono font-bold text-white tracking-tight">{value}</span>
    </div>
);

const Switch = ({ checked, onChange }: {checked: boolean, onChange: () => void}) => (
    <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:bg-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nexus-success"></div>
    </label>
);