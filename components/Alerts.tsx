import React, { useState } from 'react';
import { Alert } from '../types';
import { Bell, Plus, Trash2, Zap, ArrowRight, X, Radio, Activity } from 'lucide-react';

export const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: '1', coinSymbol: 'BTC', type: 'SMA_CROSS', condition: 'BELOW', active: true, createdAt: '2024-05-10' },
    { id: '2', coinSymbol: 'ETH', type: 'SUPERTREND_FLIP', condition: 'CROSS_UP', active: true, createdAt: '2024-05-12' },
    { id: '3', coinSymbol: 'SOL', type: 'PRICE_TARGET', condition: 'ABOVE', value: 200, active: false, createdAt: '2024-05-14' },
  ]);

  const [showModal, setShowModal] = useState(false);

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  return (
    <div className="pt-28 px-4 md:px-8 max-w-5xl mx-auto min-h-screen pb-20 animate-fade-in">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             <Radio className="w-8 h-8 text-nexus-primary animate-pulse" />
             Radar de Alertas
          </h2>
          <p className="text-nexus-muted text-sm mt-1">Monitore níveis críticos da SMA 8W e S2F 24/7.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-nexus-primary hover:bg-emerald-400 text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg shadow-nexus-primary/20"
        >
          <Plus className="w-4 h-4" /> Novo Alerta
        </button>
      </div>

      <div className="grid gap-4">
        {alerts.length === 0 ? (
            <div className="text-center py-20 opacity-50">
                <Bell className="w-16 h-16 mx-auto mb-4 text-nexus-muted" />
                <p>Nenhum alerta configurado. O mercado está silencioso.</p>
            </div>
        ) : alerts.map((alert) => (
          <div key={alert.id} className={`glass-panel p-6 rounded-2xl flex items-center justify-between group transition-all border ${alert.active ? 'border-nexus-primary/30 bg-nexus-primary/5' : 'border-white/5 bg-transparent opacity-60'}`}>
             <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center relative ${alert.active ? 'text-nexus-primary bg-black' : 'bg-white/5 text-gray-500'}`}>
                  {alert.active && <div className="absolute inset-0 rounded-full border border-nexus-primary animate-ping opacity-20"></div>}
                  <Zap className="w-5 h-5 relative z-10" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-white text-xl">{alert.coinSymbol}</span>
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${alert.active ? 'bg-nexus-primary/20 text-nexus-primary' : 'bg-white/10 text-gray-400'}`}>
                      {alert.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-nexus-muted font-light flex items-center gap-2">
                    {alert.condition === 'ABOVE' ? 'Acima de' : alert.condition === 'BELOW' ? 'Abaixo de' : 'Cruzamento'} 
                    <span className="font-mono text-white">{alert.value ? `$${alert.value}` : ' Nível Institucional'}</span>
                  </p>
                </div>
             </div>

             <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                    <div className="text-[10px] text-nexus-muted uppercase font-bold">Status</div>
                    <div className={`text-sm font-bold ${alert.active ? 'text-nexus-primary' : 'text-gray-500'}`}>{alert.active ? 'ARMADO' : 'PAUSADO'}</div>
                </div>
                <Switch checked={alert.active} onChange={() => toggleAlert(alert.id)} />
                <button 
                  onClick={() => deleteAlert(alert.id)}
                  className="w-10 h-10 rounded-full hover:bg-nexus-danger/20 hover:text-nexus-danger text-nexus-muted transition-all flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
             </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
            <div className="glass-panel rounded-3xl w-full max-w-md p-8 relative shadow-2xl animate-in zoom-in duration-200">
              <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-nexus-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-2xl font-bold text-white mb-6 tracking-tight flex items-center gap-2">
                  <Activity className="w-6 h-6 text-nexus-primary" />
                  Configurar Sentinela
              </h3>
              <div className="space-y-5">
                <div>
                  <label className="text-xs uppercase text-nexus-muted font-bold ml-1">Ativo Alvo</label>
                  <input className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white mt-2 focus:border-nexus-primary/50 outline-none transition-colors font-mono font-bold" placeholder="BTC" autoFocus />
                </div>
                <div>
                  <label className="text-xs uppercase text-nexus-muted font-bold ml-1">Gatilho Estratégico</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white mt-2 focus:border-nexus-primary/50 outline-none transition-colors appearance-none font-medium cursor-pointer">
                    <option>Perda da SMA 8 Semanas (Saída)</option>
                    <option>Rompimento da SMA 8 Semanas (Entrada)</option>
                    <option>Divergência Stock-to-Flow</option>
                    <option>Flip de SuperTrend</option>
                    <option>Alvo Fibonacci 0.618</option>
                  </select>
                </div>
                <div>
                   <label className="text-xs uppercase text-nexus-muted font-bold ml-1">Preço (Opcional)</label>
                   <input className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white mt-2 focus:border-nexus-primary/50 outline-none transition-colors font-mono" placeholder="$0.00" type="number" />
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-full bg-nexus-primary hover:bg-emerald-400 text-black py-4 rounded-xl font-bold mt-4 shadow-lg shadow-nexus-primary/20 transition-all uppercase tracking-wider"
                 >
                  Armar Alerta
                 </button>
              </div>
            </div>
        </div>
      )}
    </div>
  );
};

const Switch = ({ checked, onChange }: {checked: boolean, onChange: () => void}) => (
    <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:bg-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nexus-primary"></div>
    </label>
);