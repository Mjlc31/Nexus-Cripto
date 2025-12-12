import React from 'react';
import { Check, Star, Lock } from 'lucide-react';
import { SubscriptionPlan } from '../types';

const plans: SubscriptionPlan[] = [
  {
    id: 'monthly',
    name: 'Sobrevivente',
    price: 'R$ 99',
    period: '/mês',
    features: ['Sinal SMA 8 Semanas', 'Radar Stock-to-Flow', '5 Diagnósticos de IA/dia'],
  },
  {
    id: 'quarterly',
    name: 'Predador',
    price: 'R$ 249',
    period: '/trimestre',
    recommended: true,
    features: ['Fibonacci Áureo', 'Análises TAOG Ilimitadas', 'Alertas de Rompimento', 'Prioridade na Execução'],
  },
  {
    id: 'annual',
    name: 'Baleia',
    price: 'R$ 899',
    period: '/ano',
    features: ['Acesso API Full', 'Algoritmo Personalizado', 'Consultoria de Risco', 'Alpha Group Privado'],
  }
];

interface PricingProps {
  onSubscribe?: () => void;
}

export const Pricing: React.FC<PricingProps> = ({ onSubscribe }) => {
  return (
    <div className="py-24 px-6 max-w-6xl mx-auto relative">
      <div className="text-center mb-16 space-y-4">
        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tighter">Escolha seu lado</h2>
        <p className="text-nexus-muted max-w-xl mx-auto">
          Você pode continuar pagando o preço da ignorância ou investir na ferramenta que o Smart Money usa.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`
              relative p-8 rounded-3xl flex flex-col h-full transition-all duration-500
              ${plan.recommended 
                ? 'bg-white text-black scale-105 z-10 shadow-[0_0_50px_rgba(255,255,255,0.2)]' 
                : 'bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] text-white'
              }
            `}
          >
            {plan.recommended && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-nexus-success text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-black/10">
                    Mais Escolhido
                </div>
            )}

            <div className="mb-8">
              <h3 className={`text-xs uppercase tracking-widest font-bold mb-4 flex items-center gap-2 ${plan.recommended ? 'text-gray-500' : 'text-gray-400'}`}>
                {plan.name} {plan.name === 'Baleia' && <Lock className="w-3 h-3" />}
              </h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tighter">{plan.price}</span>
                <span className={`text-xs font-medium ${plan.recommended ? 'text-gray-500' : 'text-gray-500'}`}>{plan.period}</span>
              </div>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${plan.recommended ? 'bg-black' : 'bg-nexus-accent'}`} />
                  <span className="font-medium opacity-80">{feature}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={onSubscribe}
              className={`w-full py-4 rounded-full font-bold text-sm transition-all shadow-lg hover:shadow-xl ${
                plan.recommended 
                ? 'bg-black text-white hover:scale-105' 
                : 'bg-white/10 hover:bg-white text-white hover:text-black'
              }`}
            >
              {plan.recommended ? 'Dominar o Mercado' : 'Acessar Ferramentas'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};