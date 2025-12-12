import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Pricing } from './components/Pricing';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { CoinDetail } from './components/CoinDetail';
import { Portfolio } from './components/Portfolio';
import { Alerts } from './components/Alerts';
import { Settings } from './components/Settings';
import { TradingBot } from './components/TradingBot';
import { ViewState, CoinData } from './types';

export default function App() {
  const [view, setView] = useState<ViewState>(ViewState.LANDING);
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false); // Mock subscription state

  // Reset scroll on view change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  const handleCoinSelect = (coin: CoinData) => {
    setSelectedCoin(coin);
    setView(ViewState.DETAIL);
  };

  const handleBack = () => {
    setSelectedCoin(null);
    setView(ViewState.DASHBOARD);
  };

  // Authentication Handler Mock
  const handleLoginSuccess = () => {
    if (isSubscribed) {
      setView(ViewState.DASHBOARD);
    } else {
      // Gate: Must subscribe first
      setView(ViewState.PRICING);
    }
  };

  const handleLogout = () => {
    setIsSubscribed(false);
    setView(ViewState.LANDING);
  };

  // Subscription Handler Mock
  const handleSubscribe = () => {
    setIsSubscribed(true);
    setView(ViewState.DASHBOARD);
  };

  return (
    <div className="min-h-screen bg-nexus-black text-nexus-text font-sans selection:bg-nexus-accent selection:text-white">
      
      <Navbar view={view} setView={setView} isSubscribed={isSubscribed} />

      <main className="animate-in fade-in duration-500">
        {view === ViewState.LANDING && (
          <>
            <Hero setView={setView} />
            <Pricing onSubscribe={() => setView(ViewState.REGISTER)} />
            <footer className="py-8 text-center text-nexus-muted text-sm border-t border-nexus-border mt-12 bg-black">
              <p>© 2025 Nexus Pro Analytics. Powered by Gemini AI. Trading envolve riscos.</p>
            </footer>
          </>
        )}

        {view === ViewState.PRICING && (
          <div className="pt-20 min-h-screen flex flex-col items-center justify-center">
             <div className="text-center mb-4">
               <h2 className="text-2xl font-bold text-white">Plano Obrigatório</h2>
               <p className="text-nexus-muted">Para acessar o dashboard Nexus Pro, selecione um plano.</p>
             </div>
             <Pricing onSubscribe={handleSubscribe} />
          </div>
        )}

        {(view === ViewState.LOGIN || view === ViewState.REGISTER) && (
          <Auth view={view} setView={(v) => {
            if (v === ViewState.DASHBOARD) {
              handleLoginSuccess();
            } else {
              setView(v);
            }
          }} />
        )}

        {/* Gated Views */}
        {isSubscribed && (
          <>
            {view === ViewState.DASHBOARD && (
              <Dashboard onSelectCoin={handleCoinSelect} />
            )}
            
            {view === ViewState.PORTFOLIO && (
              <Portfolio />
            )}
            
            {view === ViewState.AUTO_TRADE && (
              <TradingBot />
            )}

            {view === ViewState.ALERTS && (
              <Alerts />
            )}

            {view === ViewState.SETTINGS && (
              <Settings onLogout={handleLogout} />
            )}

            {view === ViewState.DETAIL && selectedCoin && (
              <CoinDetail coin={selectedCoin} onBack={handleBack} />
            )}
          </>
        )}
      </main>
    </div>
  );
}