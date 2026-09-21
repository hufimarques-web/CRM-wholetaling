import React, { useState } from 'react';
import { Building2, ArrowRight, ShieldCheck, Sparkles, MapPin, CheckCircle2 } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { AppUser } from '../types/crm';

export const LoginView: React.FC = () => {
  const { login } = useCRM();
  const [selectedUser, setSelectedUser] = useState<AppUser>('Queirós');

  const handleLogin = (user: AppUser) => {
    login(user);
  };

  return (
    <div className="min-h-screen bg-[#0A0B0D] flex items-center justify-center p-4 sm:p-8 font-sans text-stone-100 relative overflow-hidden">
      {/* Subtle Luxury Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl bg-[#111215] border border-stone-800/90 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden grid grid-cols-1 md:grid-cols-2 relative z-10 backdrop-blur-md">
        
        {/* Left Side: Brand & Context (Deep Obsidian Dark) */}
        <div className="bg-[#0C0D0F] p-8 sm:p-10 text-white flex flex-col justify-between border-b md:border-b-0 md:border-r border-stone-800/80">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-black border border-stone-800 flex items-center justify-center p-1.5 shadow-lg shadow-black">
                <img src="/logo.png" alt="Wholetailing" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-sm font-normal tracking-[0.2em] uppercase font-display text-white">Wholetailing</h1>
                <p className="text-[10px] text-amber-400/90 font-light uppercase tracking-[0.15em] font-sans">CRM de Arbitragem Imobiliária</p>
              </div>
            </div>

            <div className="space-y-4 my-8">
              <h2 className="text-2xl font-light tracking-wide text-white leading-snug font-display">
                Gestão Rigorosa de Deals & CPCV em Aveiro.
              </h2>
              <p className="text-xs font-light text-stone-300/90 leading-relaxed font-sans">
                Plataforma especializada de prospeção direta, estudo de mercado automático ao m², formalização de CPCV com sinal a 10% e cessão de posição a investidores.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-stone-800/80 text-xs text-stone-300">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-light">Base de mercado calibrada para todas as freguesias de Aveiro</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-light">Rastreabilidade total e autoria por utilizador</span>
            </div>
          </div>
        </div>

        {/* Right Side: Profile Selection & Login (Dark Luxury Canvas) */}
        <div className="p-8 sm:p-10 flex flex-col justify-center space-y-6 bg-[#131417]">
          <div>
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-amber-400/90 block mb-1 font-display">
              Acesso Restrito
            </span>
            <h3 className="text-xl font-light text-white tracking-wide font-display">
              Selecione o seu Perfil
            </h3>
            <p className="text-xs font-light text-stone-300/80 mt-1 font-sans leading-relaxed">
              Todas as leads, notas, visitas e operações criadas na sessão ficam permanentemente associadas ao seu utilizador.
            </p>
          </div>

          {/* User Profile Cards in Dark Theme */}
          <div className="space-y-3">
            
            {/* Queirós Profile Card */}
            <div
              onClick={() => setSelectedUser('Queirós')}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedUser === 'Queirós'
                  ? 'border-emerald-500/70 bg-emerald-950/25 shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500/40'
                  : 'border-stone-800 hover:border-stone-700 bg-[#191A1E]'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-lg bg-emerald-700 text-white font-medium text-base flex items-center justify-center shadow-xs font-display">
                  Q
                </div>
                <div>
                  <h4 className="font-medium text-sm text-white tracking-wide leading-tight font-display">Queirós</h4>
                  <p className="text-[11px] font-light text-stone-300 mt-0.5 font-sans">Operações & Estratégia de Arbitragem</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-normal tracking-wider bg-emerald-900/50 text-emerald-300 border border-emerald-700/40">
                    Sessão Ativa Esmeralda
                  </span>
                </div>
              </div>

              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                selectedUser === 'Queirós' ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-stone-700 bg-stone-900'
              }`}>
                {selectedUser === 'Queirós' && <CheckCircle2 className="w-3.5 h-3.5" />}
              </div>
            </div>

            {/* Hugo Profile Card */}
            <div
              onClick={() => setSelectedUser('Hugo')}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedUser === 'Hugo'
                  ? 'border-amber-500/70 bg-amber-950/25 shadow-md shadow-amber-950/40 ring-1 ring-amber-500/40'
                  : 'border-stone-800 hover:border-stone-700 bg-[#191A1E]'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-lg bg-amber-700 text-white font-medium text-base flex items-center justify-center shadow-xs font-display">
                  H
                </div>
                <div>
                  <h4 className="font-medium text-sm text-white tracking-wide leading-tight font-display">Hugo</h4>
                  <p className="text-[11px] font-light text-stone-300 mt-0.5 font-sans">Comercial & Negociação com Proprietários</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-normal tracking-wider bg-amber-900/50 text-amber-300 border border-amber-700/40">
                    Sessão Ativa Âmbar
                  </span>
                </div>
              </div>

              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                selectedUser === 'Hugo' ? 'border-amber-500 bg-amber-500 text-white' : 'border-stone-700 bg-stone-900'
              }`}>
                {selectedUser === 'Hugo' && <CheckCircle2 className="w-3.5 h-3.5" />}
              </div>
            </div>

          </div>

          {/* Login Action Button */}
          <button
            onClick={() => handleLogin(selectedUser)}
            className={`w-full py-3.5 px-6 rounded-xl font-medium text-xs uppercase tracking-[0.15em] text-white shadow-lg transition-all flex items-center justify-center space-x-2 font-display ${
              selectedUser === 'Queirós'
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/50 hover:shadow-emerald-900/70'
                : 'bg-amber-600 hover:bg-amber-500 shadow-amber-950/50 hover:shadow-amber-900/70'
            }`}
          >
            <span>Entrar como {selectedUser}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[10px] font-light tracking-wider text-center text-stone-400 font-sans">
            Ambiente Wholetailing CRM • Base de dados Prisma SQLite ativa
          </p>
        </div>

      </div>
    </div>
  );
};
