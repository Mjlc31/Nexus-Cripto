import React from 'react';
import { LayoutDashboard, LogOut, LineChart, Wallet, Bell, Settings, Bot, ChevronDown } from 'lucide-react';
import { ViewState } from '../types';

interface NavbarProps {
  view: ViewState;
  setView: (view: ViewState) => void;
  isSubscribed: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ view, setView, isSubscribed }) => {
  // Only show full nav if logged in AND subscribed
  const showFullNav = isSubscribed && (view !== ViewState.LANDING && view !== ViewState.LOGIN && view !== ViewState.REGISTER && view !== ViewState.PRICING);

  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto bg-black/60 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl transition-all duration-500 max-w-5xl w-full flex items-center justify-between px-2 py-2 sm:px-3">
        
        {/* Logo Area */}
        <div 
          className="flex items-center gap-3 cursor-pointer group shrink-0 pl-2"
          onClick={() => setView(showFullNav ? ViewState.DASHBOARD : ViewState.LANDING)}
        >
          <div className="relative flex items-center justify-center">
             <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.3)]">
               <LineChart className="w-4 h-4" strokeWidth={3} />
             </div>
          </div>
          <span className="text-sm font-bold tracking-tight text-white hidden sm:block">
            NEXUS<span className="opacity-50 font-normal">PRO</span>
          </span>
        </div>

        {/* Navigation Area */}
        <div className="flex-1 flex items-center justify-end overflow-hidden">
          {!showFullNav ? (
            <div className="flex items-center gap-2 pr-2">
               <button 
                onClick={() => setView(ViewState.LOGIN)}
                className="text-xs font-medium text-nexus-muted hover:text-white transition-colors px-3 py-2"
              >
                Login
              </button>
              <button 
                onClick={() => setView(ViewState.REGISTER)}
                className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold hover:scale-105 transition-all shadow-lg"
              >
                Começar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-1.5">
              
              <NavButton 
                active={view === ViewState.DASHBOARD || view === ViewState.DETAIL} 
                onClick={() => setView(ViewState.DASHBOARD)} 
                icon={LayoutDashboard} 
                label="Mercado" 
              />
              
              <NavButton 
                active={view === ViewState.PORTFOLIO} 
                onClick={() => setView(ViewState.PORTFOLIO)} 
                icon={Wallet} 
                label="Carteira" 
                hideLabelMobile
              />
              
              <NavButton 
                active={view === ViewState.AUTO_TRADE} 
                onClick={() => setView(ViewState.AUTO_TRADE)} 
                icon={Bot} 
                label="AI Bot" 
                hideLabelMobile
              />

              <NavButton 
                active={view === ViewState.ALERTS} 
                onClick={() => setView(ViewState.ALERTS)} 
                icon={Bell} 
                label="Alertas" 
                hideLabelMobile
              />
              
              <div className="h-4 w-px bg-white/10 mx-1 shrink-0"></div>
              
              <button 
                onClick={() => setView(ViewState.SETTINGS)}
                className={`p-2 rounded-full transition-all shrink-0 ${view === ViewState.SETTINGS ? 'bg-white text-black' : 'text-nexus-muted hover:text-white hover:bg-white/10'}`}
              >
                <Settings className="w-4 h-4" />
              </button>

              <button 
                onClick={() => setView(ViewState.LANDING)}
                className="p-2 rounded-full text-nexus-muted hover:text-red-400 hover:bg-white/5 transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

// Subcomponent for Apple-style Pills
const NavButton = ({ active, onClick, icon: Icon, label, hideLabelMobile }: any) => (
  <button 
    onClick={onClick}
    className={`
      flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 shrink-0 text-xs font-medium
      ${active 
        ? 'bg-white/15 text-white backdrop-blur-md shadow-inner' 
        : 'text-nexus-muted hover:text-white hover:bg-white/5'
      }
    `}
  >
    <Icon className={`w-4 h-4 ${active ? 'text-white' : ''}`} />
    {label && <span className={`${hideLabelMobile ? 'hidden md:inline' : 'inline'}`}>{label}</span>}
  </button>
);