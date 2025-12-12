import React from 'react';
import { LayoutDashboard, LogOut, LineChart, Wallet, Bell, Settings, Bot } from 'lucide-react';
import { ViewState } from '../types';

interface NavbarProps {
  view: ViewState;
  setView: (view: ViewState) => void;
  isSubscribed: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ view, setView, isSubscribed }) => {
  const showFullNav = isSubscribed && (view !== ViewState.LANDING && view !== ViewState.LOGIN && view !== ViewState.REGISTER && view !== ViewState.PRICING);

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className={`
        pointer-events-auto bg-nexus-surface/80 backdrop-blur-2xl border border-nexus-border shadow-2xl transition-all duration-500 ease-out
        ${showFullNav ? 'rounded-2xl px-2 py-2 max-w-fit' : 'rounded-full px-6 py-4 max-w-5xl w-full flex justify-between'}
      `}>
        
        {/* Logo - Only show text when not in full nav mode (compact mode) */}
        {!showFullNav && (
            <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setView(ViewState.LANDING)}
            >
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-black rounded-full"></div>
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">Nexus Pro</span>
            </div>
        )}

        {/* Navigation Area */}
        <div className="flex items-center gap-1">
          {!showFullNav ? (
            <div className="flex items-center gap-4">
               <button 
                onClick={() => setView(ViewState.LOGIN)}
                className="text-sm font-medium text-nexus-subtext hover:text-white transition-colors"
              >
                Log in
              </button>
              <button 
                onClick={() => setView(ViewState.REGISTER)}
                className="bg-white text-black px-5 py-2 rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                Get Started
              </button>
            </div>
          ) : (
            <>
              <NavIcon 
                active={view === ViewState.DASHBOARD || view === ViewState.DETAIL} 
                onClick={() => setView(ViewState.DASHBOARD)} 
                icon={LayoutDashboard} 
                tooltip="Dashboard"
              />
              <NavIcon 
                active={view === ViewState.PORTFOLIO} 
                onClick={() => setView(ViewState.PORTFOLIO)} 
                icon={Wallet} 
                tooltip="Portfolio"
              />
              <NavIcon 
                active={view === ViewState.AUTO_TRADE} 
                onClick={() => setView(ViewState.AUTO_TRADE)} 
                icon={Bot} 
                tooltip="AI Bot"
              />
              <NavIcon 
                active={view === ViewState.ALERTS} 
                onClick={() => setView(ViewState.ALERTS)} 
                icon={Bell} 
                tooltip="Alerts"
              />
              
              <div className="h-6 w-px bg-white/10 mx-2"></div>
              
              <NavIcon 
                active={view === ViewState.SETTINGS} 
                onClick={() => setView(ViewState.SETTINGS)} 
                icon={Settings} 
                tooltip="Settings"
              />
               <button 
                onClick={() => setView(ViewState.LANDING)}
                className="p-3 rounded-xl text-nexus-subtext hover:text-nexus-danger hover:bg-nexus-surfaceHighlight transition-all"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </nav>
    </div>
  );
};

const NavIcon = ({ active, onClick, icon: Icon }: any) => (
  <button 
    onClick={onClick}
    className={`
      p-3 rounded-xl transition-all duration-300 relative group
      ${active 
        ? 'bg-nexus-surfaceHighlight text-white shadow-inner' 
        : 'text-nexus-subtext hover:text-white hover:bg-nexus-surfaceHighlight/50'
      }
    `}
  >
    <Icon className="w-5 h-5" />
    {active && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></span>}
  </button>
);