import React from 'react';
import { Check, Star } from 'lucide-react';
import { SubscriptionPlan } from '../types';

const plans: SubscriptionPlan[] = [
  {
    id: 'monthly',
    name: 'Trader',
    price: 'R$ 99',
    period: '/mês',
    features: ['SMA 8 Semanas', 'Stock-to-Flow', '5 Análises/dia'],
  },
  {
    id: 'quarterly',
    name: 'Profissional',
    price: 'R$ 249',
    period: '/trimestre',
    recommended: true,
    features: ['Fibonacci Avançado', 'Análises Ilimitadas', 'Alertas Supertrend', 'Suporte Prioritário'],
  },
  {
    id: 'annual',
    name: 'Institucional',
    price: 'R$ 899',
    period: '/ano',
    features: ['API Access', 'Estratégia Custom', 'Onboarding 1-a-1', 'Discord Privado'],
  }
];

interface PricingProps {
  onSubscribe?: () => void;
}

export const Pricing: React.FC<PricingProps> = ({ onSubscribe }) => {
  return (
    <div className="py-24 px-6 max-w-6xl mx-auto relative">
      <div className="text-center mb-16 space-y-4">
        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tighter">Acesso</h2>
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
            <div className="mb-8">
              <h3 className={`text-xs uppercase tracking-widest font-bold mb-4 ${plan.recommended ? 'text-gray-500' : 'text-gray-400'}`}>{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tighter">{plan.price}</span>
              </div>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${plan.recommended ? 'bg-black' : 'bg-white'}`} />
                  <span className="font-medium opacity-80">{feature}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={onSubscribe}
              className={`w-full py-4 rounded-full font-bold text-sm transition-all ${
                plan.recommended 
                ? 'bg-black text-white hover:scale-105' 
                : 'bg-white/10 hover:bg-white text-white hover:text-black'
              }`}
            >
              Selecionar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};