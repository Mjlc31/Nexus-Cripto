import React, { useState, useEffect, useRef } from 'react';
import { Bot, Power, Activity, Terminal, ShieldCheck, Zap, TrendingUp, DollarSign, BrainCircuit, Lock, CreditCard, ChevronRight, AlertTriangle, PlayCircle, StopCircle, Target, X, Cpu, Wallet, Network, Wifi, Layers, Crosshair, BarChart3, RefreshCcw, Bell, Skull, ShieldAlert, TrendingDown, PlusCircle } from 'lucide-react';
import { BotConfig, BotLog, TradeSignal, ActivePosition } from '../types';
import { storageService } from '../services/storageService';
import { dbService } from '../services/database';

interface PerformanceMetrics {
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  netPnl: number;
}

// Toast Notification Component
const ToastNotification = ({ message, type, onClose }: { message: string, type: string, onClose: () => void }) => (
  <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl backdrop-blur-2xl bg-black/60 border border-white/10 flex items-center gap-4 animate-in slide-in-from-right-10 duration-500 cursor-pointer hover:bg-black/70 transition-colors max-w-sm" onClick={onClose}>
    <div className={`p-2 rounded-full shrink-0 ${type === 'SIGNAL' ? 'bg-nexus-accent text-white' : 'bg-white/10 text-white'}`}>
      {type === 'SIGNAL' ? <Crosshair className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
    </div>
    <div>
      <div className="font-bold text-white text-xs uppercase tracking-wide opacity-80 mb-0.5">{type === 'SIGNAL' ? 'Alvo Confirmado' : 'Sistema'}</div>
      <div className="text-sm text-white font-medium">{message}</div>
    </div>
  </div>
);

export const TradingBot: React.FC = () => {
  const [hasLicense, setHasLicense] = useState(storageService.hasBotLicense());
  const [config, setConfig] = useState<BotConfig>(storageService.getBotConfig());
  const [logs, setLogs] = useState<BotLog[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  
  // Wallet & Margin State
  const [walletBalance, setWalletBalance] = useState(0); // Available in connected wallet
  const [marginBalance, setMarginBalance] = useState(5000.00); // Allocated to Bot
  const [manualMargin, setManualMargin] = useState<string>('500'); // Input for manual trade
  
  // System State
  const [asterStatus, setAsterStatus] = useState<'IDLE' | 'SCANNING' | 'ANALYZING' | 'EXECUTING'>('IDLE');
  const [notification, setNotification] = useState<{msg: string, type: string} | null>(null);
  
  // Metrics State
  const [performance, setPerformance] = useState<PerformanceMetrics>({
    totalTrades: 324,
    winRate: 72.4,
    profitFactor: 2.8,
    netPnl: 12450.00
  });

  // Interaction State
  const [pendingSignal, setPendingSignal] = useState<TradeSignal | null>(null);
  const [activePosition, setActivePosition] = useState<ActivePosition | null>(null);
  const [isProcessingBuy, setIsProcessingBuy] = useState(false);

  // Initial Load
  useEffect(() => {
    const loadData = async () => {
        const historyLogs = await dbService.getLogs(50);
        if (historyLogs.length > 0) setLogs(historyLogs);
        
        const activeTrades = await dbService.getTrades();
        if (activeTrades.length > 0) setActivePosition(activeTrades[0]);

        // Simulate reading wallet
        setWalletBalance(12450.00);
    };
    loadData();
  }, []);

  useEffect(() => {
    storageService.saveBotConfig(config);
  }, [config]);

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

  const addLog = async (type: BotLog['type'], message: string, asset?: string) => {
    const newLog: BotLog = {
      id: Date.now().toString() + Math.random(),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour12: false }) + '.' + Math.floor(Math.random()*999),
      type,
      message,
      asset
    };
    setLogs(prev => [...prev.slice(-99), newLog]);
    await dbService.addLog(newLog);
  };

  // --- MANUAL TRADE LOGIC ---
  const handleManualTrade = async (direction: 'LONG' | 'SHORT') => {
    const amount = parseFloat(manualMargin);
    if (isNaN(amount) || amount <= 0) {
      showToast('Valor de margem inválido', 'INFO');
      return;
    }
    if (amount > marginBalance) {
      showToast('Saldo de margem insuficiente. Deposite mais.', 'INFO');
      return;
    }

    // Asset Selection (Simulated for Demo)
    const asset = 'BTC';
    const currentPrice = 96420.50;
    
    // Leverage calc
    const leverage = config.leverage;

    // Calculate TP/SL/Liq
    // SL: 1% movement against
    // TP: 2% movement favor
    const stopLossPct = 0.01;
    const takeProfitPct = 0.03;
    
    let stopLoss, takeProfit, liquidationPrice;

    if (direction === 'LONG') {
        stopLoss = currentPrice * (1 - stopLossPct);
        takeProfit = currentPrice * (1 + takeProfitPct);
        liquidationPrice = currentPrice * (1 - (1/leverage));
    } else {
        stopLoss = currentPrice * (1 + stopLossPct);
        takeProfit = currentPrice * (1 - takeProfitPct);
        liquidationPrice = currentPrice * (1 + (1/leverage));
    }

    setMarginBalance(prev => prev - amount);

    const position: ActivePosition = {
      id: Date.now().toString(),
      asset,
      direction,
      leverage,
      entryPrice: currentPrice,
      currentPrice: currentPrice,
      margin: amount,
      pnlUsd: 0,
      pnlPercent: 0,
      liquidationPrice,
      stopLoss,
      takeProfit
    };

    setActivePosition(position);
    await dbService.saveTrade(position);
    addLog('SUCCESS', `ORDEM MANUAL: ${direction} ${asset} x${leverage} @ $${currentPrice.toFixed(2)}`);
    showToast(`Posição ${direction} aberta com sucesso!`, 'SIGNAL');
  };

  // --- DEPOSIT LOGIC ---
  const handleDeposit = () => {
    if (walletBalance > 1000) {
        setWalletBalance(prev => prev - 1000);
        setMarginBalance(prev => prev + 1000);
        addLog('INFO', 'Depósito de $1,000.00 transferido da Carteira Spot para Margem Futura.');
    } else {
        showToast('Saldo na carteira insuficiente.', 'INFO');
    }
  };

  // --- ENGINE LOGIC (AUTO BOT) ---
  useEffect(() => {
    let interval: any;

    if (config.isActive && hasLicense && !activePosition) {
       // Only run auto-scan if no active position
       setAsterStatus('SCANNING');
       
       interval = setInterval(() => {
          const random = Math.random();
          // Simulate finding a trade rarely
          if (random > 0.95 && !pendingSignal) {
             const asset = Math.random() > 0.5 ? 'ETH' : 'BTC';
             const direction = Math.random() > 0.5 ? 'LONG' : 'SHORT';
             const price = asset === 'BTC' ? 96420 : 2750;
             
             // Auto generate signal
             const signal: TradeSignal = {
                id: Date.now().toString(),
                asset,
                direction,
                leverage: config.leverage,
                entryPrice: price,
                stopLoss: direction === 'LONG' ? price * 0.99 : price * 1.01,
                takeProfit: direction === 'LONG' ? price * 1.02 : price * 0.98,
                confidence: 89,
                reason: 'Auto-Scan: SMA Breakout',
                timestamp: Date.now()
             };
             
             setPendingSignal(signal);
             setAsterStatus('ANALYZING');
             addLog('SIGNAL', `Sinal Automático: ${direction} ${asset} detectado.`);
             
             if (config.autoExecute) {
                 // Auto execute logic here (simplified for demo, re-uses manual logic structure mostly)
                 setTimeout(() => {
                     setPendingSignal(null);
                     // Just a log for demo, realistically would call authorizeTrade similar to manual
                     addLog('INFO', 'Auto-Execução: Aguardando confirmação de liquidez...'); 
                 }, 3000);
             }
          } else {
             if(Math.random() > 0.7) addLog('INFO', 'Escaneando books de oferta... Nenhuma assimetria detectada.');
          }
       }, 3000);
    } else {
      if (!activePosition) setAsterStatus('IDLE');
    }
    return () => clearInterval(interval);
  }, [config.isActive, hasLicense, activePosition, pendingSignal]);

  // Position PnL Simulation
  useEffect(() => {
      let pnlInterval: any;
      if (activePosition) {
          pnlInterval = setInterval(() => {
            const volatility = activePosition.asset === 'BTC' ? 0.0005 : 0.001;
            const change = (Math.random() * volatility * 4) - (volatility * 1.5); // Slight bias
            const newPrice = activePosition.currentPrice * (1 + change);
            
            const priceMovePct = (newPrice - activePosition.entryPrice) / activePosition.entryPrice;
            const rawPnlPct = activePosition.direction === 'LONG' ? priceMovePct : -priceMovePct;
            const leveragedPnlPct = rawPnlPct * activePosition.leverage;
            const pnlUsd = activePosition.margin * leveragedPnlPct;

            setActivePosition(prev => prev ? ({...prev, currentPrice: newPrice, pnlPercent: leveragedPnlPct * 100, pnlUsd}) : null);
          }, 1000);
      }
      return () => clearInterval(pnlInterval);
  }, [activePosition]);

  const closePosition = () => {
    if (!activePosition) return;
    const finalAmount = activePosition.margin + activePosition.pnlUsd;
    setMarginBalance(prev => prev + finalAmount);
    setPerformance(prev => ({
        ...prev, 
        totalTrades: prev.totalTrades + 1, 
        netPnl: prev.netPnl + activePosition.pnlUsd,
        winRate: activePosition.pnlUsd > 0 ? prev.winRate + 0.1 : prev.winRate - 0.1 // Simple sim
    }));
    addLog(activePosition.pnlUsd >= 0 ? 'SUCCESS' : 'WARNING', `Trade Encerrado. P&L: $${activePosition.pnlUsd.toFixed(2)}`);
    setActivePosition(null);
    setAsterStatus('IDLE');
  };

  // --- RENDER UNAUTHORIZED ---
  if (!hasLicense) {
    return (
      <div className="pt-24 px-4 min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="relative z-10 w-full max-w-lg glass-panel rounded-3xl p-10 text-center shadow-2xl mx-4">
           <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
             <Lock className="w-6 h-6 text-nexus-accent" />
           </div>
           <h1 className="text-3xl font-bold text-white tracking-tight mb-3">Acesso Negado</h1>
           <p className="text-nexus-muted text-sm leading-relaxed mb-8">
             O Módulo ASTER (Algo-Sniper) é restrito. Adquira a licença para operar com execução institucional.
           </p>
           <button onClick={handlePurchase} disabled={isProcessingBuy} className="w-full bg-white text-black hover:bg-gray-200 py-4 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50">
             {isProcessingBuy ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : <><CreditCard className="w-4 h-4" /> Desbloquear Protocolo ($1,000)</>}
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 px-4 md:px-8 max-w-[1600px] mx-auto min-h-screen pb-20">
      
      {notification && (
        <ToastNotification message={notification.msg} type={notification.type} onClose={() => setNotification(null)} />
      )}

      {/* Header HUD */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
         <div>
            <h2 className="text-3xl font-bold text-white tracking-tight mb-1">Terminal ASTER <span className="text-nexus-muted font-normal">v4.0</span></h2>
            <div className="flex items-center gap-2">
               <span className={`w-2 h-2 rounded-full ${config.isActive ? 'bg-nexus-success animate-pulse' : 'bg-nexus-muted'}`}></span>
               <span className="text-xs font-mono text-nexus-muted uppercase">
                  {config.isActive ? 'MODO AUTOMÁTICO' : 'MODO MANUAL / HÍBRIDO'}
               </span>
            </div>
         </div>
         <div className="flex gap-4">
             {/* Wallet Integration Display */}
             <div className="px-4 py-2 rounded-xl border bg-white/5 border-white/5 flex flex-col items-end min-w-[140px]">
                 <span className="text-[10px] uppercase tracking-wider text-nexus-muted font-bold flex items-center gap-1">
                    <Wallet className="w-3 h-3" /> Carteira Spot
                 </span>
                 <span className="text-lg font-mono font-bold text-white tracking-tight">${walletBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
             </div>
             
             {/* Bot Margin Display */}
             <div className="px-4 py-2 rounded-xl border bg-nexus-primary/5 border-nexus-primary/20 flex flex-col items-end min-w-[140px] relative group cursor-pointer" onClick={handleDeposit}>
                 <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlusCircle className="w-4 h-4 text-nexus-primary" />
                 </div>
                 <span className="text-[10px] uppercase tracking-wider text-nexus-primary font-bold">Margem Disponível</span>
                 <span className="text-lg font-mono font-bold text-white tracking-tight">${marginBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
             </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        
        {/* Left Column: Controls (3 Cols) */}
        <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
           {/* Auto-Bot Switch */}
           <div className="glass-panel rounded-3xl p-6">
               <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Auto-Sniper</span>
                  <Switch checked={config.isActive} onChange={() => setConfig(prev => ({ ...prev, isActive: !prev.isActive }))} />
               </div>
               <p className="text-[10px] text-nexus-muted leading-relaxed">
                  Quando ativo, o ASTER buscará e executará entradas baseadas na estratégia SMA 8W automaticamente. Desative para operar manualmente.
               </p>
           </div>

           {/* Leverage Control */}
           <div className="glass-panel rounded-3xl p-6">
               <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Alavancagem</span>
                  <span className="text-nexus-accent font-mono font-bold">{config.leverage}x</span>
               </div>
               <input 
                 type="range" min="1" max="50" step="1" 
                 value={config.leverage} 
                 onChange={(e) => setConfig({...config, leverage: parseInt(e.target.value)})}
                 className="w-full accent-nexus-accent h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
               />
               <div className="flex justify-between mt-2 text-[10px] text-nexus-muted font-mono">
                  <span>1x</span>
                  <span>25x</span>
                  <span>50x</span>
               </div>
           </div>

           {/* Manual Trade Inputs (Only if no active position) */}
           {!activePosition && (
               <div className="glass-panel rounded-3xl p-6 border border-white/10">
                   <div className="text-xs font-bold text-white uppercase tracking-wider mb-3">Margem da Operação</div>
                   <div className="relative">
                       <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-muted" />
                       <input 
                         type="number"
                         value={manualMargin}
                         onChange={(e) => setManualMargin(e.target.value)}
                         className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-9 pr-4 text-white font-mono font-bold focus:border-nexus-accent outline-none transition-colors"
                       />
                   </div>
                   <div className="flex justify-between mt-2">
                       {[100, 500, 1000, 2000].map(amt => (
                           <button key={amt} onClick={() => setManualMargin(amt.toString())} className="text-[10px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded text-nexus-muted hover:text-white transition-colors">
                               ${amt}
                           </button>
                       ))}
                   </div>
               </div>
           )}
        </div>

        {/* Middle Column: Execution Terminal (6 Cols) */}
        <div className="lg:col-span-6 order-1 lg:order-2">
           <div className="glass-panel rounded-3xl min-h-[500px] h-full relative overflow-hidden flex flex-col border border-white/10">
              
              {/* Terminal Background */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

              <div className="relative z-10 p-8 flex-1 flex flex-col justify-center">
                  
                  {activePosition ? (
                      /* --- ACTIVE POSITION HUD --- */
                      <div className="w-full max-w-lg mx-auto bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
                          {/* Top Bar */}
                          <div className="bg-white/5 p-6 flex justify-between items-center border-b border-white/5">
                              <div className="flex items-center gap-3">
                                  <div className={`w-3 h-3 rounded-full animate-pulse ${activePosition.direction === 'LONG' ? 'bg-nexus-success' : 'bg-nexus-danger'}`}></div>
                                  <div>
                                      <h2 className="text-xl font-bold text-white">{activePosition.asset} / USD</h2>
                                      <div className="flex gap-2 text-xs">
                                          <span className={`font-bold px-1.5 rounded ${activePosition.direction === 'LONG' ? 'bg-nexus-success/20 text-nexus-success' : 'bg-nexus-danger/20 text-nexus-danger'}`}>
                                              {activePosition.direction} {activePosition.leverage}x
                                          </span>
                                      </div>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <div className="text-[10px] uppercase text-nexus-muted font-bold">PNL (ROI)</div>
                                  <div className={`text-2xl font-mono font-bold ${activePosition.pnlPercent >= 0 ? 'text-nexus-success text-glow' : 'text-nexus-danger text-danger-glow'}`}>
                                      {activePosition.pnlPercent >= 0 ? '+' : ''}{activePosition.pnlPercent.toFixed(2)}%
                                  </div>
                              </div>
                          </div>

                          {/* Data Grid */}
                          <div className="p-6 grid grid-cols-2 gap-4">
                              <DataCell label="Preço de Entrada" value={activePosition.entryPrice} icon={Crosshair} color="text-white" />
                              <DataCell label="Preço Atual" value={activePosition.currentPrice} icon={Activity} color="text-nexus-muted" />
                              <DataCell label="Take Profit" value={activePosition.takeProfit} icon={Target} color="text-nexus-success" />
                              <DataCell label="Liquidação" value={activePosition.liquidationPrice} icon={Skull} color="text-nexus-danger" />
                              <DataCell label="Stop Loss" value={activePosition.stopLoss} icon={ShieldAlert} color="text-nexus-danger" />
                              <DataCell label="Margem" value={activePosition.margin} icon={DollarSign} color="text-white" />
                          </div>

                          {/* Action Footer */}
                          <div className="p-4 bg-white/5 border-t border-white/5">
                              <div className="flex justify-between items-center mb-4 px-2">
                                  <span className="text-xs font-bold text-nexus-muted uppercase">Lucro/Prejuízo Real</span>
                                  <span className={`text-xl font-mono font-bold ${activePosition.pnlUsd >= 0 ? 'text-nexus-success' : 'text-nexus-danger'}`}>
                                      {activePosition.pnlUsd >= 0 ? '+' : ''}${activePosition.pnlUsd.toFixed(2)}
                                  </span>
                              </div>
                              <button onClick={closePosition} className="w-full py-4 bg-white hover:bg-gray-200 text-black rounded-xl font-bold transition-all text-sm uppercase tracking-wider shadow-lg">
                                  Encerrar Posição
                              </button>
                          </div>
                      </div>
                  ) : pendingSignal && config.isActive ? (
                      /* --- AUTO SIGNAL DETECTED --- */
                      <div className="w-full max-w-md mx-auto text-center">
                          <div className="w-24 h-24 mx-auto bg-nexus-accent/20 rounded-full flex items-center justify-center animate-pulse mb-6">
                              <Target className="w-10 h-10 text-nexus-accent" />
                          </div>
                          <h2 className="text-2xl font-bold text-white mb-2">Sinal Detectado: {pendingSignal.asset}</h2>
                          <p className="text-nexus-muted mb-6">Analisando liquidez para entrada automática...</p>
                          <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                              <div className="h-full bg-nexus-accent animate-[scan_2s_linear_infinite]"></div>
                          </div>
                      </div>
                  ) : (
                      /* --- IDLE / MANUAL MODE --- */
                      <div className="w-full max-w-lg mx-auto">
                          <div className="text-center mb-10">
                              <h2 className="text-4xl font-bold text-white tracking-tighter mb-2">Terminal de Execução</h2>
                              <p className="text-nexus-muted">Selecione a direção. O bot gerencia o risco.</p>
                          </div>

                          {config.isActive ? (
                              <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-white/10 rounded-3xl bg-white/5">
                                  <Activity className="w-8 h-8 text-nexus-accent animate-pulse mb-4" />
                                  <span className="text-nexus-accent font-bold uppercase tracking-widest text-xs">Escaneando Mercado...</span>
                              </div>
                          ) : (
                              <div className="grid grid-cols-2 gap-4">
                                  <button 
                                    onClick={() => handleManualTrade('LONG')}
                                    className="h-40 bg-gradient-to-br from-nexus-success/20 to-nexus-success/5 border border-nexus-success/30 hover:border-nexus-success hover:scale-[1.02] transition-all rounded-3xl flex flex-col items-center justify-center gap-2 group"
                                  >
                                      <TrendingUp className="w-10 h-10 text-nexus-success group-hover:drop-shadow-[0_0_10px_rgba(48,209,88,0.5)]" />
                                      <span className="text-2xl font-bold text-white">LONG</span>
                                      <span className="text-[10px] uppercase font-bold text-nexus-success tracking-wider bg-nexus-success/10 px-2 py-1 rounded">Apostar na Alta</span>
                                  </button>

                                  <button 
                                    onClick={() => handleManualTrade('SHORT')}
                                    className="h-40 bg-gradient-to-br from-nexus-danger/20 to-nexus-danger/5 border border-nexus-danger/30 hover:border-nexus-danger hover:scale-[1.02] transition-all rounded-3xl flex flex-col items-center justify-center gap-2 group"
                                  >
                                      <TrendingDown className="w-10 h-10 text-nexus-danger group-hover:drop-shadow-[0_0_10px_rgba(255,69,58,0.5)]" />
                                      <span className="text-2xl font-bold text-white">SHORT</span>
                                      <span className="text-[10px] uppercase font-bold text-nexus-danger tracking-wider bg-nexus-danger/10 px-2 py-1 rounded">Apostar na Baixa</span>
                                  </button>
                              </div>
                          )}
                          
                          <div className="mt-8 flex justify-center gap-6 text-xs text-nexus-muted font-mono">
                              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-nexus-success rounded-full"></div> TP: +3.00%</span>
                              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-nexus-danger rounded-full"></div> SL: -1.00%</span>
                              <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-white rounded-full"></div> Taxa: 0.04%</span>
                          </div>
                      </div>
                  )}
              </div>
           </div>
        </div>

        {/* Right Column: Logs (3 Cols) */}
        <div className="lg:col-span-3 order-3 lg:order-3">
           <div className="glass-panel rounded-3xl h-64 lg:h-full flex flex-col overflow-hidden">
              <div className="p-4 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                 <span className="text-xs font-bold text-nexus-muted uppercase tracking-wider">Log de Combate</span>
                 <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-white/10"></div>
                    <div className="w-2 h-2 rounded-full bg-white/10"></div>
                 </div>
              </div>
              <div className="flex-1 p-4 overflow-y-auto font-mono text-[10px] space-y-2 scrollbar-thin">
                 {logs.map((log) => (
                    <div key={log.id} className="flex gap-2 opacity-80 hover:opacity-100 transition-opacity border-l-2 border-transparent hover:border-nexus-muted pl-1">
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

// Subcomponent for Data Grid
const DataCell = ({ label, value, icon: Icon, color }: any) => (
    <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex flex-col justify-between h-20">
        <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider opacity-70 ${color}`}>
            <Icon className="w-3 h-3" /> {label}
        </div>
        <div className={`font-mono font-bold text-lg ${color}`}>
            ${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
        </div>
    </div>
);

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