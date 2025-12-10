import React, { useState, useEffect } from 'react';
import { PortfolioPosition } from '../types';
import { Wallet, Plus, RefreshCw, ShieldCheck, BrainCircuit, X, DollarSign, ArrowUpRight, ArrowDownRight, PieChart, Trash2, Link as LinkIcon, Globe, Zap, Smartphone, Layers } from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip } from 'recharts';
import { analyzePortfolio } from '../services/geminiService';
import { storageService } from '../services/storageService';

const COLORS = ['#0A84FF', '#30D158', '#FFD60A', '#FF453A', '#BF5AF2', '#5E5CE6'];

export const Portfolio: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectStep, setConnectStep] = useState<string>('');
  const [positions, setPositions] = useState<PortfolioPosition[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newAsset, setNewAsset] = useState({ symbol: '', amount: '', price: '' });

  useEffect(() => {
    const loadedPositions = storageService.getPortfolio();
    if (loadedPositions.length > 0) {
      setPositions(loadedPositions);
      setIsConnected(true);
    }
  }, []);

  const handleWalletConnect = (providerName: string) => {
    setShowWalletModal(false);
    
    // Se já estiver na tela principal, apenas simula um refresh
    if (isConnected) {
        setIsConnecting(true); // Reusa estado para loading overlay se quiser, ou cria um local
        // Hack rápido para demo: usar um toast ou loading local seria melhor, mas aqui vamos simular
        const originalText = connectStep;
        setConnectStep(`Sincronizando com ${providerName}...`);
        
        // Simplesmente adiciona um delay para simular a conexão
        setTimeout(() => {
            setConnectStep('');
            setIsConnecting(false);
            alert(`${providerName} conectada com sucesso! Saldos atualizados.`);
        }, 1500);
        return;
    }

    // Fluxo inicial de conexão (tela vazia)
    connectWallet(providerName);
  };

  const connectWallet = (providerName = 'Carteira') => {
    setIsConnecting(true);
    setConnectStep('Iniciando handshake seguro...');
    setTimeout(() => {
      setConnectStep(`Solicitando assinatura em ${providerName}...`);
      setTimeout(() => {
        setConnectStep('Sincronizando saldos on-chain...');
        setTimeout(() => {
          const current = storageService.getPortfolio();
          setPositions(current);
          setIsConnected(true);
          setIsConnecting(false);
        }, 1500);
      }, 1500);
    }, 1000);
  };

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(newAsset.price);
    const amount = parseFloat(newAsset.amount);
    const currentPrice = price * (1 + (Math.random() * 0.1 - 0.05)); 

    const position: PortfolioPosition = {
      id: Date.now().toString(),
      coinId: newAsset.symbol.toLowerCase(),
      symbol: newAsset.symbol.toUpperCase(),
      name: newAsset.symbol.toUpperCase(),
      amount: amount,
      avgBuyPrice: price,
      currentPrice: currentPrice,
      valueUsd: amount * currentPrice,
      pnlPercent: ((currentPrice - price) / price) * 100,
      pnlUsd: (currentPrice - price) * amount,
      allocation: 0, 
      signal: 'HOLD',
      source: 'MANUAL'
    };

    const updatedPositions = storageService.addPosition(position);
    const totalValue = updatedPositions.reduce((acc, p) => acc + p.valueUsd, 0);
    const finalPositions = updatedPositions.map(p => ({
      ...p,
      allocation: (p.valueUsd / totalValue) * 100
    }));

    setPositions(finalPositions);
    storageService.savePortfolio(finalPositions);
    setShowAddModal(false);
    setNewAsset({ symbol: '', amount: '', price: '' });
  };

  const runPortfolioAnalysis = async () => {
    if (positions.length === 0) return;
    setIsAnalyzing(true);
    const analysis = await analyzePortfolio(positions);
    setAiAnalysis(analysis);
    setIsAnalyzing(false);
  };

  const totalValue = positions.reduce((acc, curr) => acc + curr.valueUsd, 0);
  const totalPnL = positions.reduce((acc, curr) => acc + curr.pnlUsd, 0);

  if (!isConnected && positions.length === 0) {
    return (
      <div className="pt-32 px-6 max-w-4xl mx-auto min-h-screen flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-8 backdrop-blur-md">
          <Wallet className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tighter">Portfólio</h1>
        <p className="text-nexus-muted max-w-lg mb-12 text-lg font-light">
          Conecte sua carteira para sincronização automática ou adicione ativos manualmente para rastreamento.
        </p>

        {isConnecting ? (
          <div className="glass-panel rounded-2xl p-8 w-full max-w-sm">
            <RefreshCw className="w-6 h-6 text-nexus-accent animate-spin mx-auto mb-4" />
            <p className="text-white text-sm font-medium animate-pulse">{connectStep}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button 
              onClick={() => setShowWalletModal(true)}
              className="w-full bg-white text-black hover:bg-gray-200 py-4 rounded-full font-bold transition-all"
            >
              Conectar Carteira
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="w-full bg-transparent border border-white/20 hover:border-white text-white py-4 rounded-full font-medium transition-all"
            >
              Entrada Manual
            </button>
          </div>
        )}

        {/* Wallet Modal for Initial State */}
        {showWalletModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
                <div className="glass-panel rounded-3xl w-full max-w-sm p-6 relative shadow-2xl animate-in zoom-in duration-200">
                    <button onClick={() => setShowWalletModal(false)} className="absolute top-6 right-6 text-nexus-muted hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                    <h3 className="text-xl font-bold text-white mb-6">Conectar Carteira</h3>
                    <div className="space-y-3">
                        <WalletOption name="MetaMask" color="text-orange-500" icon={Globe} onClick={() => handleWalletConnect('MetaMask')} />
                        <WalletOption name="Phantom" color="text-purple-500" icon={Wallet} onClick={() => handleWalletConnect('Phantom')} />
                        <WalletOption name="Solflare" color="text-yellow-500" icon={Zap} onClick={() => handleWalletConnect('Solflare')} />
                        <WalletOption name="WalletConnect" color="text-blue-500" icon={Smartphone} onClick={() => handleWalletConnect('WalletConnect')} />
                    </div>
                </div>
            </div>
        )}
        
        {/* Modal Logic Included Below */}
      </div>
    );
  }

  return (
    <div className="pt-28 px-4 md:px-8 max-w-[1600px] mx-auto min-h-screen pb-20">
      
      {/* Header Summary */}
      <div className="glass-panel p-8 rounded-3xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="text-nexus-muted text-xs font-bold uppercase tracking-widest mb-1">Total Balance</div>
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-5xl md:text-6xl font-bold text-white font-mono tracking-tighter">${totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            <span className={`px-3 py-1 rounded-full text-sm font-bold backdrop-blur-md border border-white/5 ${totalPnL >= 0 ? 'bg-nexus-success/10 text-nexus-success' : 'bg-nexus-danger/10 text-nexus-danger'}`}>
              {totalPnL >= 0 ? '+' : ''}{totalPnL.toLocaleString(undefined, {style: 'currency', currency: 'USD'})}
            </span>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
             onClick={() => setShowWalletModal(true)}
             className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full font-bold transition-all flex items-center gap-2 group"
          >
             <LinkIcon className="w-4 h-4 text-nexus-muted group-hover:text-white transition-colors" />
             <span className="hidden md:inline text-sm">Conectar</span>
          </button>

          <button onClick={() => setShowAddModal(true)} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">
            <Plus className="w-5 h-5" />
          </button>
          <button 
            onClick={runPortfolioAnalysis}
            disabled={isAnalyzing}
            className="px-6 py-3 bg-nexus-accent hover:bg-blue-600 text-white rounded-full font-bold transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
            <span className="hidden md:inline">Análise IA</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset List */}
        <div className="lg:col-span-2 glass-panel rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-bold text-white">Ativos</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/[0.02] text-xs uppercase text-nexus-muted font-medium">
                  <tr>
                    <th className="px-6 py-4 text-left">Ativo</th>
                    <th className="px-6 py-4 text-right">Saldo</th>
                    <th className="px-6 py-4 text-right">Preço Méd.</th>
                    <th className="px-6 py-4 text-right">Valor</th>
                    <th className="px-6 py-4 text-right">P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {positions.map((pos) => (
                    <tr key={pos.id} className="hover:bg-white/[0.02] transition-colors group cursor-default">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-sm font-bold text-white">
                            {pos.symbol[0]}
                          </div>
                          <div>
                            <div className="text-white font-medium">{pos.name}</div>
                            <div className="text-xs text-nexus-muted flex items-center gap-1">{pos.source}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right text-nexus-muted font-mono text-sm">
                        {pos.amount.toLocaleString()} <span className="text-[10px]">{pos.symbol}</span>
                      </td>
                      <td className="px-6 py-5 text-right text-nexus-muted font-mono text-sm">
                        ${pos.avgBuyPrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-5 text-right text-white font-mono font-medium">
                        ${pos.valueUsd.toLocaleString()}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className={`font-mono text-sm ${pos.pnlPercent >= 0 ? 'text-nexus-success' : 'text-nexus-danger'}`}>
                          {pos.pnlPercent >= 0 ? '+' : ''}{pos.pnlPercent.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Allocation */}
          <div className="glass-panel rounded-3xl p-6 flex flex-col items-center justify-center min-h-[300px]">
            <h3 className="text-sm font-bold text-nexus-muted uppercase tracking-wider mb-4 w-full text-left">Alocação</h3>
            <div className="h-48 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={positions}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="valueUsd"
                    stroke="none"
                  >
                    {positions.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ReTooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                  />
                </RePieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                 <div className="text-2xl font-bold text-white">{positions.length}</div>
                 <div className="text-[10px] text-nexus-muted uppercase">Ativos</div>
              </div>
            </div>
          </div>

          {/* AI Insight */}
          <div className="glass-panel rounded-3xl p-6 border border-nexus-accent/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <BrainCircuit className="w-24 h-24 text-nexus-accent" />
            </div>
            <h3 className="text-sm font-bold text-white mb-2">Nexus Insight</h3>
            <div className="prose prose-invert prose-sm">
              {aiAnalysis ? (
                <p className="text-gray-300 font-light text-sm leading-relaxed">{aiAnalysis}</p>
              ) : (
                <p className="text-nexus-muted text-sm">Gere um relatório para obter análise tática do seu portfólio.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Wallet Selection Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
            <div className="glass-panel rounded-3xl w-full max-w-sm p-6 relative shadow-2xl animate-in zoom-in duration-200">
                <button onClick={() => setShowWalletModal(false)} className="absolute top-6 right-6 text-nexus-muted hover:text-white">
                    <X className="w-5 h-5" />
                </button>
                <h3 className="text-xl font-bold text-white mb-6">Conectar Carteira</h3>
                <div className="space-y-3">
                    <WalletOption name="MetaMask" color="text-orange-500" icon={Globe} onClick={() => handleWalletConnect('MetaMask')} />
                    <WalletOption name="Phantom" color="text-purple-500" icon={Wallet} onClick={() => handleWalletConnect('Phantom')} />
                    <WalletOption name="Solflare" color="text-yellow-500" icon={Zap} onClick={() => handleWalletConnect('Solflare')} />
                    <WalletOption name="WalletConnect" color="text-blue-500" icon={Smartphone} onClick={() => handleWalletConnect('WalletConnect')} />
                </div>
            </div>
        </div>
      )}

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
            <div className="glass-panel rounded-3xl w-full max-w-md p-8 relative shadow-2xl">
              <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 text-nexus-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-2xl font-bold text-white mb-6 tracking-tight">Novo Ativo</h3>
              <form onSubmit={handleAddAsset} className="space-y-5">
                <div>
                  <label className="text-xs uppercase text-nexus-muted font-bold ml-1">Símbolo</label>
                  <input 
                    required 
                    value={newAsset.symbol}
                    onChange={e => setNewAsset({...newAsset, symbol: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white mt-2 focus:border-white/30 outline-none transition-colors" 
                    placeholder="BTC"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase text-nexus-muted font-bold ml-1">Quantidade</label>
                    <input 
                      required 
                      type="number" step="any"
                      value={newAsset.amount}
                      onChange={e => setNewAsset({...newAsset, amount: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white mt-2 focus:border-white/30 outline-none transition-colors" 
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase text-nexus-muted font-bold ml-1">Preço Médio</label>
                    <input 
                      required 
                      type="number" step="any"
                      value={newAsset.price}
                      onChange={e => setNewAsset({...newAsset, price: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white mt-2 focus:border-white/30 outline-none transition-colors" 
                      placeholder="$0.00"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full bg-nexus-accent hover:bg-blue-600 text-white py-4 rounded-xl font-bold mt-4 shadow-lg shadow-blue-500/20">
                  Adicionar ao Portfólio
                </button>
              </form>
            </div>
        </div>
      )}
      
      {/* Loading Overlay if connecting from Dashboard context */}
      {isConnecting && isConnected && (
         <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm">
             <div className="bg-black border border-white/10 px-8 py-6 rounded-2xl flex items-center gap-4 shadow-2xl">
                 <RefreshCw className="w-6 h-6 text-nexus-accent animate-spin" />
                 <span className="text-white font-medium">{connectStep || 'Processando...'}</span>
             </div>
         </div>
      )}
    </div>
  );
};

const WalletOption = ({ name, icon: Icon, onClick, color }: any) => (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group"
    >
        <div className={`w-10 h-10 rounded-full bg-black/40 flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5" />
        </div>
        <span className="font-bold text-white group-hover:translate-x-1 transition-transform">{name}</span>
        <ArrowUpRight className="w-4 h-4 text-nexus-muted ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
);