import React from 'react';
import { ViewState } from '../types';
import { ChevronRight, ArrowRight, Zap, Shield, TrendingUp } from 'lucide-react';

interface HeroProps {
  setView: (view: ViewState) => void;
}

export const Hero: React.FC<HeroProps> = ({ setView }) => {
  return (
    <div className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {/* Animated Spotlight */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80vw] h-[80vh] bg-blue-600/10 rounded-full blur-[120px] animate-spotlight opacity-50"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vh] bg-purple-600/5 rounded-full blur-[100px] animate-pulse-slow opacity-30"></div>
        
        {/* Subtle Grid - Perspective */}
        <div 
          className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]"
          style={{ transform: 'perspective(1000px) rotateX(20deg) translateY(-50px) scale(1.5)', opacity: 0.4 }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 text-center">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 animate-fade-in-up" style={{animationDelay: '0s'}}>
          <span className="w-2 h-2 rounded-full bg-nexus-success animate-pulse"></span>
          <span className="text-[11px] font-medium tracking-wide uppercase text-nexus-muted">Nexus AI v3.0 Live</span>
        </div>
        
        {/* Main Title */}
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-white mb-6 animate-fade-in-up text-balance" style={{animationDelay: '0.1s'}}>
          Financial <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">Clarity.</span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg md:text-2xl text-nexus-muted font-light max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-in-up text-balance" style={{animationDelay: '0.2s'}}>
          Algoritmos institucionais simplificados.
          <br className="hidden md:block"/> Análise on-chain, S2F e Machine Learning em uma única interface.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
          <button 
            onClick={() => setView(ViewState.REGISTER)}
            className="group relative px-8 py-4 bg-white text-black rounded-full font-medium text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
          >
            <span className="relative z-10 flex items-center gap-2">
              Começar Agora <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
            </span>
          </button>
          
          <button 
            onClick={() => setView(ViewState.LOGIN)}
            className="px-8 py-4 rounded-full font-medium text-lg text-white border border-white/10 hover:bg-white/5 transition-all backdrop-blur-sm"
          >
            Acessar Demo
          </button>
        </div>
      </div>

      {/* Floating Features - Bento Style */}
      <div className="max-w-6xl mx-auto px-6 mt-24 md:mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up" style={{animationDelay: '0.5s'}}>
         <FeatureCard 
           icon={<TrendingUp className="w-6 h-6 text-nexus-accent" />}
           title="SMA 8-Semanas"
           desc="O padrão ouro para identificação de tendências de longo prazo em Bitcoin."
         />
         <FeatureCard 
           icon={<Zap className="w-6 h-6 text-yellow-400" />}
           title="Execução HFT"
           desc="Motor de baixa latência para identificar anomalias de volume em milissegundos."
         />
         <FeatureCard 
           icon={<Shield className="w-6 h-6 text-nexus-success" />}
           title="Risco Assimétrico"
           desc="Modelos matemáticos focados em proteção de capital e upside convexo."
         />
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: any) => (
  <div className="group p-8 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-sm hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 hover:-translate-y-2 cursor-default">
    <div className="mb-4 p-3 bg-white/5 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-500">{icon}</div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-sm text-nexus-muted leading-relaxed">{desc}</p>
  </div>
);