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
    <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center p-4 sm:p-8 font-sans">
      <div className="w-full max-w-4xl bg-white border border-stone-300 shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* Left Side: Brand & Context (Obsidian Architectural Black) */}
        <div className="bg-[#141518] p-8 sm:p-10 text-white flex flex-col justify-between border-b md:border-b-0 md:border-r border-stone-800">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-black border border-stone-800 flex items-center justify-center p-1.5 shadow-md shadow-black/60">
                <img src="/logo.png" alt="Wholetailing" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-base font-black tracking-widest uppercase font-mono text-white">Wholetailing</h1>
                <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">CRM de Arbitragem Imobiliária</p>
              </div>
            </div>

            <div className="space-y-4 my-8">
              <h2 className="text-2xl font-black tracking-tight text-white leading-tight">
                Gestão Rigorosa de Deals & CPCV em Aveiro.
              </h2>
              <p className="text-xs text-stone-400 leading-relaxed">
                Plataforma exclusiva de prospeção, estudo de mercado automático ao m², formalização de CPCV com sinal a 10% e venda a investidores.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-stone-800/80 text-xs text-stone-400">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Base de mercado calibrada para todas as freguesias de Aveiro</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Rastreabilidade total e autoria por utilizador</span>
            </div>
          </div>
        </div>

        {/* Right Side: Profile Selection & Login (Crisp Warm Canvas) */}
        <div className="p-8 sm:p-10 flex flex-col justify-center space-y-6 bg-white">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 block mb-1">
              Acesso Restrito
            </span>
            <h3 className="text-xl font-black text-stone-900 tracking-tight">
              Selecione o seu Perfil
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Todas as leads, notas, visitas e propostas criadas na sessão ficam automaticamente associadas ao seu nome.
            </p>
          </div>

          {/* User Profile Cards */}
          <div className="space-y-3">
            
            {/* Queirós Profile Card */}
            <div
              onClick={() => setSelectedUser('Queirós')}
              className={`p-4 border transition-all cursor-pointer flex items-center justify-between ${
                selectedUser === 'Queirós'
                  ? 'border-emerald-600 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-500/20'
                  : 'border-stone-200 hover:border-stone-400 bg-white'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 bg-emerald-700 text-white font-black text-base flex items-center justify-center shadow-xs">
                  Q
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-stone-900 leading-tight">Queirós</h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">Operações & Estratégia de Arbitragem</p>
                  <span className="inline-block mt-1 px-2 py-0.2 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                    Sessão Ativa Esmeralda
                  </span>
                </div>
              </div>

              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                selectedUser === 'Queirós' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-stone-300'
              }`}>
                {selectedUser === 'Queirós' && <CheckCircle2 className="w-3.5 h-3.5" />}
              </div>
            </div>

            {/* Hugo Profile Card */}
            <div
              onClick={() => setSelectedUser('Hugo')}
              className={`p-4 border transition-all cursor-pointer flex items-center justify-between ${
                selectedUser === 'Hugo'
                  ? 'border-amber-600 bg-amber-50/40 shadow-xs ring-1 ring-amber-500/20'
                  : 'border-stone-200 hover:border-stone-400 bg-white'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 bg-amber-700 text-white font-black text-base flex items-center justify-center shadow-xs">
                  H
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-stone-900 leading-tight">Hugo</h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">Comercial & Negociação com Proprietários</p>
                  <span className="inline-block mt-1 px-2 py-0.2 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800">
                    Sessão Ativa Âmbar
                  </span>
                </div>
              </div>

              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                selectedUser === 'Hugo' ? 'border-amber-600 bg-amber-600 text-white' : 'border-stone-300'
              }`}>
                {selectedUser === 'Hugo' && <CheckCircle2 className="w-3.5 h-3.5" />}
              </div>
            </div>

          </div>

          {/* Login Action Button (Architectural straight card with rounded button) */}
          <button
            onClick={() => handleLogin(selectedUser)}
            className={`w-full py-3.5 px-6 rounded-xl font-black text-xs uppercase tracking-wider text-white shadow-md transition-all flex items-center justify-center space-x-2 ${
              selectedUser === 'Queirós'
                ? 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-700/20'
                : 'bg-amber-700 hover:bg-amber-800 shadow-amber-700/20'
            }`}
          >
            <span>Entrar como {selectedUser}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[10px] text-center text-stone-400">
            Ambiente Wholetailing CRM • Sessão segura gravada localmente
          </p>
        </div>

      </div>
    </div>
  );
};
