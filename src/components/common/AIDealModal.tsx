import React, { useState } from 'react';
import { X, Sparkles, TrendingUp, ShieldAlert, CheckCircle, MessageSquare, Copy, Check, ArrowRight } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { formatCurrency, getUserTheme } from '../../utils/formatters';

export const AIDealModal: React.FC = () => {
  const { isAIModalOpen, setIsAIModalOpen, aiTargetLead, currentUser, addNoteToLead, setIsProposalFormOpen, setPreselectedProposalLeadId } = useCRM();
  const [copied, setCopied] = useState(false);
  const [addedNote, setAddedNote] = useState(false);

  if (!isAIModalOpen || !aiTargetLead) return null;

  const lead = aiTargetLead;
  const userTheme = getUserTheme(currentUser);

  // Deal Calculations for AI scoring
  const price = lead.valorMinimoAbsoluto || 1;
  const evaluation = (lead.valorMinimoAbsoluto + (lead.margemPotencial || 0)) || (price * 1.35);
  const margin = evaluation - price;
  const spread = Math.round((margin / evaluation) * 100);

  // Calculate Deal Score (0 - 100)
  let score = 55;
  if (spread >= 35) score += 25;
  else if (spread >= 20) score += 15;
  else if (spread <= 10) score -= 15;

  if (lead.flexibilidade === 'Sim') score += 10;
  if (lead.prazoPretendido.toLowerCase().includes('imediat') || lead.prazoPretendido.toLowerCase().includes('curto')) score += 10;

  score = Math.max(20, Math.min(98, score));

  // Suggested Sinal (10%)
  const suggestedSinal = Math.round(price * 0.10);
  const suggestedMultiple = Number((margin / (suggestedSinal || 1)).toFixed(1));

  // AI Generated Talking Points
  const pitchPoints = [
    `Referenciar que na zona de ${lead.freguesia}, uma transação rápida e segura exige uma margem de segurança atrativa para investidores.`,
    `Apresentar proposta com sinal imediato de ${formatCurrency(suggestedSinal)} (10%) no ato do CPCV, destacando rapidez e dispensa de condições resolutivas bancárias.`,
    lead.flexibilidade === 'Sim'
      ? `Aproveitar a abertura declarada de negociação para fechar o valor mínimo de ${formatCurrency(lead.valorMinimoAbsoluto)}.`
      : `Enfatizar que o pagamento rápido e a pronta assinatura de CPCV compensam o valor acordado.`
  ];

  const handleCopyPitch = () => {
    const text = `ANÁLISE AI WHOLETAILING: ${lead.nomeProprietario}\n` +
      `Localização: ${lead.freguesia}\n` +
      `Score Oportunidade: ${score}/100\n` +
      `Margem Prevista: ${formatCurrency(margin)} (${spread}% spread)\n` +
      `Sinal Sugerido (10%): ${formatCurrency(suggestedSinal)} (Retorno: ${suggestedMultiple}x)\n` +
      `Pontos de Negociação:\n- ` + pitchPoints.join('\n- ');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddNoteFromAI = () => {
    const noteText = `🤖 Análise AI Deal Assistant (Score ${score}/100): Margem prevista de ${formatCurrency(margin)} com sinal de ${formatCurrency(suggestedSinal)} (${suggestedMultiple}x retorno). Recomendado avançar para proposta com CPCV a 90 dias.`;
    addNoteToLead(lead.id, noteText);
    setAddedNote(true);
    setTimeout(() => setAddedNote(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-[#FAF8F5] rounded-2xl shadow-2xl border border-stone-300 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Top Header (Dark Obsidian luxury) */}
        <div className="bg-[#16171B] px-6 py-4 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-md shadow-amber-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-tight text-white">Assistente AI de Arbitragem</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
                  Wholetailing Intelligence
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Oportunidade: <strong className="text-stone-200">{lead.nomeProprietario}</strong> ({lead.freguesia})
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setIsAIModalOpen(false)}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto text-xs text-stone-800">
          
          {/* Top Score Banner */}
          <div className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black ${
                score >= 75 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                score >= 50 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                'bg-red-50 text-red-700 border border-red-200'
              }`}>
                <span className="text-xl leading-none">{score}</span>
                <span className="text-[9px] uppercase font-semibold mt-0.5">Score</span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-stone-900">
                  {score >= 75 ? 'Excelente Oportunidade de Arbitragem' :
                   score >= 50 ? 'Oportunidade Viável com Margem Razoável' :
                   'Oportunidade de Alto Risco / Pouco Desconto'}
                </h4>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Estudo de mercado: <strong className="text-stone-700">{lead.etiquetaMercado || 'Abaixo do mercado'}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-stone-100 pt-2 sm:pt-0 sm:pl-4 w-full sm:w-auto justify-between sm:justify-start">
              <div>
                <span className="text-[10px] uppercase font-semibold text-stone-400 block">Sinal 10%</span>
                <span className="text-sm font-extrabold text-stone-900">{formatCurrency(suggestedSinal)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-stone-400 block">Múltiplo</span>
                <span className="text-sm font-extrabold text-emerald-600">{suggestedMultiple}x</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Comparison */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3 rounded-xl border border-stone-200">
              <span className="text-[10px] font-semibold text-stone-400 block">Preço de Entrada</span>
              <span className="text-sm font-bold text-stone-900 mt-0.5 block">{formatCurrency(price)}</span>
              <span className="text-[10px] text-stone-500">{lead.precoM2 ? `${lead.precoM2} €/m²` : 'Sem m²'}</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-stone-200">
              <span className="text-[10px] font-semibold text-stone-400 block">Preço por m² Real</span>
              <span className="text-sm font-bold text-stone-900 mt-0.5 block">
                {lead.precoM2 ? `${lead.precoM2} €/m²` : '-'}
              </span>
              <span className="text-[10px] font-semibold text-stone-500">
                {lead.areaM2 ? `${lead.areaM2} m² totais` : 'Área não definida'}
              </span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-stone-200">
              <span className="text-[10px] font-semibold text-stone-400 block">Margem Bruta Estimada</span>
              <span className="text-sm font-bold text-emerald-600 mt-0.5 block">{formatCurrency(margin)}</span>
              <span className="text-[10px] text-stone-500">{spread}% spread de saída</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-stone-200">
              <span className="text-[10px] font-semibold text-stone-400 block">Prazo Pretendido</span>
              <span className="text-xs font-bold text-stone-800 mt-0.5 block truncate">{lead.prazoPretendido}</span>
              <span className="text-[10px] text-stone-500">Flexível: {lead.flexibilidade}</span>
            </div>
          </div>

          {/* AI Negotiation Recommendations */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                Argumentos Recomendados para {userTheme.name}
              </h5>
              <button
                onClick={handleCopyPitch}
                className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-md transition"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copiado!' : 'Copiar Dicas'}</span>
              </button>
            </div>

            <div className="space-y-2">
              {pitchPoints.map((pt, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-[#F8F6F1] p-2.5 rounded-lg border border-stone-200/60">
                  <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-[11px] text-stone-700 leading-relaxed">{pt}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Strategy & Risks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-stone-200 space-y-2">
              <h6 className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                Estratégia de Wholetailing
              </h6>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Recomendado celebrar CPCV com <strong>prazo de 90 a 120 dias</strong> com cláusula expressa de cessão de posição contratual. Publicitar o ativo a investidores da carteira por {formatCurrency(Math.round(price + margin * 0.7))}.
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-stone-200 space-y-2">
              <h6 className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                Atenção / Checklist
              </h6>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Verificar caderneta predial, eventuais ónus ou herdeiros múltiplos. Caso haja obras necessárias, manter margem de contingência mínima de 15%.
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="bg-stone-100 px-6 py-3.5 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleAddNoteFromAI}
            className="w-full sm:w-auto px-3.5 py-2 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 rounded-xl text-xs font-semibold shadow-2xs transition flex items-center justify-center gap-1.5"
          >
            {addedNote ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <MessageSquare className="w-3.5 h-3.5 text-stone-500" />}
            <span>{addedNote ? 'Nota Adicionada!' : 'Gravar Análise nas Notas'}</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsAIModalOpen(false)}
              className="px-4 py-2 text-stone-600 hover:text-stone-900 text-xs font-semibold rounded-xl"
            >
              Fechar
            </button>
            <button
              onClick={() => {
                setIsAIModalOpen(false);
                setPreselectedProposalLeadId(lead.id);
                setIsProposalFormOpen(true);
              }}
              className="px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <span>Gerar Proposta</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
