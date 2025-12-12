import React from 'react';
import { ViewState } from '../types';
import { ChevronRight, Zap, Target, Lock, Activity, TrendingDown } from 'lucide-react';

interface HeroProps {
  setView: (view: ViewState) => void;
}

export const Hero: React.FC<HeroProps> = ({ setView }) => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-nexus-bg">
      
      {/* Background Ambience - The "Green Candle" glow */}
      <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-nexus-primary/10 rounded-full blur-[150px] pointer-events-none opacity-60 animate-pulse-fast"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded bg-nexus-primary/10 border border-nexus-primary/20 cursor-default animate-in fade-in slide-in-from-top-4 duration-1000">
          <span className="w-2 h-2 rounded-full bg-nexus-primary animate-pulse"></span>
          <span className="text-[10px] font-mono font-bold text-nexus-primary uppercase tracking-widest">Setup Institucional: Online</span>
        </div>
        
        {/* Headline - Visceral & Direct */}
        <h1 className="text-5xl md:text-8xl font-extrabold tracking-tighter text-white mb-6 leading-[0.9] animate-in zoom-in duration-700">
          PARE DE SER A<br/>
          <span className="text-nexus-muted line-through decoration-nexus-danger decoration-4 opacity-50">LIQUIDEZ.</span> 
          <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-nexus-primary to-emerald-300 text-glow">VIRE A BALEIA.</span>
        </h1>
        
        {/* Subtitle - The User's Strategy as the Hero */}
        <p className="text-lg md:text-2xl text-nexus-muted font-medium max-w-3xl mx-auto leading-relaxed mb-10 text-balance animate-in fade-in delay-200">
          O varejo opera notícias. Você opera a <span className="text-white border-b border-nexus-primary/50">Média de 8 Semanas</span> e o <span className="text-white border-b border-nexus-primary/50">Stock-to-Flow</span>.
          <br/>A única ferramenta desenhada para proteger seu capital e multiplicar seu patrimônio.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 animate-in fade-in delay-300">
          <button 
            onClick={() => setView(ViewState.REGISTER)}
            className="group relative w-full sm:w-auto px-8 py-5 bg-nexus-primary text-black rounded font-bold text-lg hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(0,255,148,0.3)] hover:shadow-[0_0_50px_rgba(0,255,148,0.5)] flex items-center justify-center gap-2 overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span className="relative z-10 flex items-center gap-2">
               ACESSAR O SETUP <Zap className="w-5 h-5 fill-current" />
            </span>
          </button>
          
          <button 
            onClick={() => setView(ViewState.LOGIN)}
            className="w-full sm:w-auto px-8 py-5 rounded border border-white/10 font-bold text-lg text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4 text-nexus-muted" /> Login
          </button>
        </div>

        {/* Social Proof / Stats - The "Hook" */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-white/10 pt-8 animate-in fade-in delay-500">
           <StatBox label="Precisão (Backtest)" value="89.4%" sub="Modelo S2F + Fibbo" />
           <StatBox label="Sinais Hoje" value="12" sub="Acima da SMA 8W" color="text-nexus-primary" />
           <StatBox label="Capital Protegido" value="$42M+" sub="Via Gestão de Risco" />
           <StatBox label="Viés de Mercado" value="BULLISH" sub="Ciclo de Alta Confirmado" color="text-nexus-primary" />
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, sub, color = "text-white" }: any) => (
  <div className="text-center p-4 hover:bg-white/5 rounded transition-colors cursor-default">
     <div className={`text-3xl md:text-4xl font-mono font-bold ${color} tracking-tighter mb-1`}>{value}</div>
     <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-nexus-muted mb-1">{label}</div>
     <div className="text-[10px] text-nexus-muted opacity-60 font-mono">{sub}</div>
  </div>
);