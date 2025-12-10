import React from 'react';
import { User, CreditCard, BellRing, Shield, ChevronRight, LogOut } from 'lucide-react';

export const Settings: React.FC = () => {
  return (
    <div className="pt-28 px-4 md:px-6 max-w-3xl mx-auto min-h-screen pb-20">
      <h2 className="text-3xl font-bold text-white mb-8 tracking-tight">Ajustes</h2>

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="glass-panel rounded-2xl p-6 flex items-center gap-4">
           <div className="w-16 h-16 rounded-full bg-gradient-to-br from-nexus-accent to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-lg">
             JS
           </div>
           <div className="flex-1">
             <h3 className="text-lg font-bold text-white">João Silva</h3>
             <p className="text-nexus-muted text-sm">joao.silva@nexus.pro</p>
           </div>
           <button className="bg-white/10 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-white/20 transition-colors">
             Editar
           </button>
        </div>

        {/* Settings Group */}
        <div className="glass-panel rounded-2xl overflow-hidden divide-y divide-white/5">
           <SettingItem icon={CreditCard} title="Assinatura" subtitle="Plano Institucional Ativo" />
           <SettingItem icon={BellRing} title="Notificações" subtitle="Push & Email" toggle />
           <SettingItem icon={Shield} title="Segurança" subtitle="2FA Ativado" />
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden divide-y divide-white/5">
             <button className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors text-nexus-danger">
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sair da conta</span>
             </button>
        </div>
      </div>
    </div>
  );
};

const SettingItem = ({ icon: Icon, title, subtitle, toggle }: any) => (
  <div className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors cursor-pointer group">
     <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white">
           <Icon className="w-4 h-4" />
        </div>
        <div>
           <div className="text-white font-medium text-sm">{title}</div>
           <div className="text-xs text-nexus-muted">{subtitle}</div>
        </div>
     </div>
     {toggle ? (
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" defaultChecked className="sr-only peer" />
            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:bg-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-nexus-success"></div>
        </label>
     ) : (
        <ChevronRight className="w-4 h-4 text-nexus-muted group-hover:text-white transition-colors" />
     )}
  </div>
);