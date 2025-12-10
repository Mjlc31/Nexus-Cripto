import React, { useState } from 'react';
import { Alert } from '../types';
import { Bell, Plus, Trash2, Zap, ArrowRight, X } from 'lucide-react';

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
    <div className="pt-28 px-4 md:px-8 max-w-5xl mx-auto min-h-screen pb-20">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Alertas</h2>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="grid gap-4">
        {alerts.map((alert) => (
          <div key={alert.id} className="glass-panel p-6 rounded-2xl flex items-center justify-between group hover:bg-white/[0.04] transition-all">
             <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${alert.active ? 'bg-nexus-accent/20 text-nexus-accent' : 'bg-white/5 text-gray-500'}`}>
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-white text-xl">{alert.coinSymbol}</span>
                    <span className="text-xs text-nexus-muted uppercase tracking-wider font-medium bg-white/5 px-2 py-0.5 rounded">
                      {alert.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-nexus-muted font-light">
                    {alert.condition === 'ABOVE' ? 'Acima de' : alert.condition === 'BELOW' ? 'Abaixo de' : 'Cruzamento'} 
                    {alert.value ? ` $${alert.value}` : ' Nível Chave'}
                  </p>
                </div>
             </div>

             <div className="flex items-center gap-6">
                <Switch checked={alert.active} onChange={() => toggleAlert(alert.id)} />
                <button 
                  onClick={() => deleteAlert(alert.id)}
                  className="text-nexus-muted hover:text-nexus-danger transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
             </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
            <div className="glass-panel rounded-3xl w-full max-w-md p-8 relative shadow-2xl">
              <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-nexus-muted hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-2xl font-bold text-white mb-6 tracking-tight">Novo Monitoramento</h3>
              <div className="space-y-5">
                <div>
                  <label className="text-xs uppercase text-nexus-muted font-bold ml-1">Ativo</label>
                  <input className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white mt-2 focus:border-white/30 outline-none transition-colors" placeholder="Ex: BTC" />
                </div>
                <div>
                  <label className="text-xs uppercase text-nexus-muted font-bold ml-1">Condição</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white mt-2 focus:border-white/30 outline-none transition-colors appearance-none">
                    <option>Cruzamento SMA 8 Semanas</option>
                    <option>Inversão SuperTrend</option>
                    <option>Preço Alvo</option>
                    <option>RSI Sobrevendido</option>
                  </select>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-full bg-white text-black py-4 rounded-xl font-bold mt-4 hover:scale-[1.02] transition-transform"
                 >
                  Criar Alerta
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
        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:bg-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nexus-success"></div>
    </label>
);