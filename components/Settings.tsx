import React from 'react';
import { User, CreditCard, BellRing, Shield, ChevronRight, LogOut, Wallet } from 'lucide-react';
import { ViewState } from '../types';

interface SettingsProps {
  onLogout: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onLogout }) => {
  return (
    <div className="pt-28 px-4 md:px-6 max-w-3xl mx-auto min-h-screen pb-20 animate-fade-in">
      <h2 className="text-3xl font-bold text-white mb-8 tracking-tight flex items-center gap-3">
        <User className="w-8 h-8 text-nexus-primary" />
        Perfil & Ajustes
      </h2>

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="glass-panel rounded-2xl p-6 flex items-center gap-4 border border-white/10 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-10 bg-nexus-primary/5 rounded-full blur-2xl"></div>
           
           <div className="w-16 h-16 rounded-full bg-gradient-to-br from-nexus-accent to-emerald-800 flex items-center justify-center text-xl font-bold text-black shadow-[0_0_20px_rgba(0,255,148,0.3)] relative z-10">
             TR
           </div>
           <div className="flex-1 relative z-10">
             <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Trader Alpha</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-nexus-primary text-black uppercase">Pro</span>
             </div>
             <p className="text-nexus-muted text-sm font-mono">ID: 8X-9921-A</p>
           </div>
           <button className="bg-white/5 border border-white/10 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-white/20 transition-colors z-10">
             Editar
           </button>
        </div>

        {/* Settings Group */}
        <div className="glass-panel rounded-2xl overflow-hidden divide-y divide-white/5 border border-white/10">
           <SettingItem icon={CreditCard} title="Assinatura" subtitle="Plano Baleia (Anual) - Renovação em 12/2025" />
           <SettingItem icon={Wallet} title="Carteiras Conectadas" subtitle="2 Endereços (EVM, Solana)" />
           <SettingItem icon={BellRing} title="Notificações Alpha" subtitle="Push imediato em rompimento de SMA" toggle />
           <SettingItem icon={Shield} title="Segurança Avançada" subtitle="2FA via Authenticator Ativado" />
        </div>

        {/* Danger Zone */}
        <div className="glass-panel rounded-2xl overflow-hidden border border-nexus-danger/20">
             <button 
                onClick={onLogout}
                className="w-full flex items-center justify-between p-4 hover:bg-nexus-danger/10 transition-colors text-nexus-danger group"
             >
                <div className="flex items-center gap-3">
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Encerrar Sessão</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
             </button>
        </div>
        
        <p className="text-center text-nexus-muted text-xs pt-4">Nexus Pro v4.2.1 (Build 240901) • Conexão Segura</p>
      </div>
    </div>
  );
};

const SettingItem = ({ icon: Icon, title, subtitle, toggle }: any) => (
  <div className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors cursor-pointer group">
     <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center text-nexus-muted group-hover:text-white group-hover:border-nexus-primary/30 transition-all">
           <Icon className="w-5 h-5" />
        </div>
        <div>
           <div className="text-white font-bold text-sm">{title}</div>
           <div className="text-xs text-nexus-muted">{subtitle}</div>
        </div>
     </div>
     {toggle ? (
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" defaultChecked className="sr-only peer" />
            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:bg-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nexus-primary"></div>
        </label>
     ) : (
        <ChevronRight className="w-4 h-4 text-nexus-muted group-hover:text-white transition-colors" />
     )}
  </div>
);