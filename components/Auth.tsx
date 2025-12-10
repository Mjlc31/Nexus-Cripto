import React from 'react';
import { ViewState } from '../types';
import { ArrowLeft, LineChart } from 'lucide-react';

interface AuthProps {
  view: ViewState;
  setView: (view: ViewState) => void;
}

export const Auth: React.FC<AuthProps> = ({ view, setView }) => {
  const isRegister = view === ViewState.REGISTER;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setView(ViewState.DASHBOARD);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
       {/* Background Decoration */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-nexus-accent/10 rounded-full blur-[100px] pointer-events-none"></div>

       <button 
        onClick={() => setView(ViewState.LANDING)}
        className="absolute top-8 left-8 text-nexus-muted hover:text-white flex items-center gap-2 transition-colors z-20"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="w-full max-w-md glass-panel p-10 rounded-3xl shadow-2xl relative z-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-white/20">
             <LineChart className="w-6 h-6 text-black" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">{isRegister ? 'Nova Conta' : 'Acesso'}</h2>
          <p className="text-nexus-muted text-sm font-light">
            {isRegister ? 'Junte-se à elite da análise on-chain.' : 'Bem-vindo de volta ao Nexus.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <input 
                type="text" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-white/30 transition-colors placeholder-white/20"
                placeholder="Nome Completo"
              />
            </div>
          )}
          <div>
            <input 
              type="email" 
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-white/30 transition-colors placeholder-white/20"
              placeholder="Email"
            />
          </div>
          <div>
            <input 
              type="password" 
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-white/30 transition-colors placeholder-white/20"
              placeholder="Senha"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-white text-black hover:bg-gray-200 font-bold py-4 rounded-xl transition-all mt-4 shadow-lg"
          >
            {isRegister ? 'Criar Conta' : 'Entrar'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-nexus-muted">
          <button 
            onClick={() => setView(isRegister ? ViewState.LOGIN : ViewState.REGISTER)}
            className="hover:text-white transition-colors"
          >
            {isRegister ? 'Já possui conta? Entrar' : "Não tem conta? Cadastre-se"}
          </button>
        </div>
      </div>
    </div>
  );
};