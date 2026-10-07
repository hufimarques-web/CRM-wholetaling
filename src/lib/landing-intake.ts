import { createHash } from 'node:crypto';

export const PRIVACY_VERSION = '2026-10-07-v1';
export const REVIEW_PRIVACY_VERSION = '2026-10-07-v2';
export class IntakeError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}

export function normalizePhone(value: string) {
  let phone = value.replace(/[\s().-]/g, '').replace(/^00/, '+');
  if (/^9\d{8}$/.test(phone)) phone = `+351${phone}`;
  return phone;
}

export function validateSubmission(body: unknown, now = Date.now()) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new IntakeError(400, 'Pedido inválido.');
  const raw = body as Record<string, unknown>;
  const text = (key: string, max: number, required = true) => {
    if (!required && (raw[key] === undefined || raw[key] === '')) return '';
    if (typeof raw[key] !== 'string') throw new IntakeError(400, `Confirme o campo ${key}.`);
    const value = (raw[key] as string).trim();
    if ((required && !value) || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) throw new IntakeError(400, `Confirme o campo ${key}.`);
    return value;
  };
  const choice = (key: string, options: string[]) => {
    const value = text(key, 120);
    if (!options.includes(value)) throw new IntakeError(400, `Confirme o campo ${key}.`);
    return value;
  };
  const number = (key: string, max: number, optional = false) => {
    const value = text(key, 30, !optional);
    if (!value && optional) return null;
    if (!/^\d+(\.\d+)?$/.test(value) || !Number.isFinite(Number(value)) || Number(value) < 1 || Number(value) > max) throw new IntakeError(400, `Confirme o campo ${key}.`);
    return Number(value);
  };
  if (text('website', 200, false)) throw new IntakeError(400, 'Não foi possível aceitar o pedido.');
  if (typeof raw.startedAt !== 'number' || !Number.isFinite(raw.startedAt) || now - raw.startedAt < 2500 || now - raw.startedAt > 172800000) throw new IntakeError(400, 'Atualize a página e tente novamente.');
  const requestId = text('requestId', 36);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) throw new IntakeError(400, 'Atualize a página e tente novamente.');
  const reviewOnly = raw.privacyVersion === REVIEW_PRIVACY_VERSION;
  if (reviewOnly ? raw.contactRequested !== true : raw.contactConsent !== true || raw.privacyVersion !== PRIVACY_VERSION) throw new IntakeError(400, 'Confirme que pretende enviar este pedido.');
  const telefone = normalizePhone(text('telefone', 24));
  if (!/^\+[1-9]\d{7,14}$/.test(telefone) || (telefone.startsWith('+351') && !/^\+3519\d{8}$/.test(telefone))) throw new IntakeError(400, 'Confirme o telemóvel.');
  if (!reviewOnly && normalizePhone(text('telefoneConfirmacao', 24)) !== telefone) throw new IntakeError(400, 'Os números de telemóvel não coincidem.');
  const tipoImovel = choice('tipoImovel', ['Moradia', 'Apartamento', 'Terreno', 'Prédio']);
  const estados = tipoImovel === 'Terreno'
    ? ['Construção confirmada por documento', 'Possível construção, ainda por confirmar', 'Terreno rústico / agrícola', 'Não sei']
    : ['Pronto a habitar', 'Precisa de pequenas obras', 'Precisa de muitas obras', 'Não sei', ...(tipoImovel === 'Moradia' ? ['Ruína'] : [])];
  const propostasRecebidas = choice('propostasRecebidas', ['sim', 'nao', 'na']);
  const precoPedido = number('precoPedido', 100000000, true);
  const valorMinimoAbsoluto = number('valorMinimoAbsoluto', 100000000)!;
  if (precoPedido && valorMinimoAbsoluto > precoPedido) throw new IntakeError(400, 'O mínimo é superior ao preço pedido. Confirme os valores.');
  const data = {
    nomeProprietario: text('nomeProprietario', 100), telefone,
    localizacao: text('localizacao', 180), tipoImovel,
    areaM2: number('areaM2', 10000000)!,
    tipoArea: choice('tipoArea', ['Área de habitação', 'Área bruta de construção', 'Área do terreno', 'Não tenho a certeza']),
    situacaoAtual: choice('situacaoAtual', estados),
    licencaHabitacao: tipoImovel === 'Terreno' ? 'Não aplicável (terreno)' : choice('licencaHabitacao', ['sim', 'nao']),
    numaImobiliaria: choice('numaImobiliaria', ['sim', 'nao']),
    tempoVenda: choice('tempoVenda', ['Ainda não está anunciado', 'Há menos de 3 meses', 'Entre 3 e 6 meses', 'Entre 6 e 12 meses', 'Há mais de 1 ano']),
    propostasRecebidas,
    melhorProposta: propostasRecebidas === 'sim' ? number('melhorProposta', 100000000, true) : null,
    prazoPretendido: choice('prazoPretendido', ['Nos próximos 30 dias', 'Entre 1 e 3 meses', 'Entre 3 e 6 meses', 'Sem prazo definido']),
    motivo: text('motivo', 600, false), precoPedido, valorMinimoAbsoluto,
    flexibilidade: choice('flexibilidade', ['Sim', 'Não']),
    enquadramento: choice('enquadramento', ['sim', 'talvez']),
    horario: choice('horario', ['Manhã', 'Hora de almoço', 'Tarde', 'Depois das 18h']),
    fotosDisponiveis: choice('fotosDisponiveis', ['Sim, posso enviar depois', 'Ainda preciso de tirar']),
    privacyVersion: reviewOnly ? REVIEW_PRIVACY_VERSION : PRIVACY_VERSION
  };
  if (data.nomeProprietario.length < 2 || data.localizacao.length < 2) throw new IntakeError(400, 'Confirme o nome e a localização.');
  const id = `lp-${createHash('sha256').update(JSON.stringify({ requestId, ...data })).digest('hex')}`;
  return { id, data };
}

export function leadRecord(submission: ReturnType<typeof validateSubmission>, now = new Date()) {
  const { id, data: d } = submission;
  const yesNo = (value: string) => value === 'sim' ? 'Sim' : value === 'nao' ? 'Não' : value;
  const notes = [
    'PEDIDO RECEBIDO NA LANDING PAGE',
    `Localização indicada: ${d.localizacao}`,
    `Tipo de imóvel: ${d.tipoImovel}`,
    `Área: ${d.areaM2} m² (${d.tipoArea})`,
    `Estado: ${d.situacaoAtual}`,
    `Licença de habitação: ${yesNo(d.licencaHabitacao)}`,
    `Numa imobiliária: ${yesNo(d.numaImobiliaria)}`,
    `Tempo à venda: ${d.tempoVenda}`,
    `Propostas anteriores: ${d.propostasRecebidas === 'na' ? 'Ainda não anunciou' : yesNo(d.propostasRecebidas)}`,
    `Melhor proposta: ${d.melhorProposta === null ? 'Não indicada' : `${d.melhorProposta} €`}`,
    `Preço pedido: ${d.precoPedido === null ? 'Não indicado' : `${d.precoPedido} €`}`,
    `Mínimo indicado: ${d.valorMinimoAbsoluto} €`,
    `Aceita negociar: ${d.flexibilidade}`,
    `Preço e condições: ${d.enquadramento === 'sim' ? 'Aceita conversar, dependendo das condições' : 'Quer saber mais'}`,
    `Prazo pretendido: ${d.prazoPretendido}`,
    `Motivo: ${d.motivo || 'Não indicado'}`,
    `Melhor horário: ${d.horario}`,
    `Fotografias: ${d.fotosDisponiveis}`,
    d.privacyVersion === REVIEW_PRIVACY_VERSION
      ? 'Telemóvel apresentado para confirmação antes do envio; não verificado por SMS.'
      : 'Telemóvel confirmado por dupla introdução; não verificado por SMS.',
    `Pediu contacto sobre este imóvel. Aviso de privacidade: ${d.privacyVersion}.`,
    `Recebido em: ${now.toISOString()}`,
    'Localização exata, preço de mercado e margem ainda por analisar.'
  ].join('\n');
  return {
    id, nomeProprietario: d.nomeProprietario, telefone: d.telefone,
    freguesia: 'Por confirmar', concelho: null, moradaZona: d.localizacao,
    tipoImovel: d.tipoImovel, estadoImovel: d.situacaoAtual, areaM2: d.areaM2,
    origem: 'Outro', valorMinimoAbsoluto: d.valorMinimoAbsoluto,
    flexibilidade: d.flexibilidade, prazoPretendido: d.prazoPretendido === 'Nos próximos 30 dias' ? 'Imediatamente' : d.prazoPretendido === 'Sem prazo definido' ? 'Sem pressa' : 'Curto prazo',
    margemPotencial: 0, precoM2: null, mediaFreguesiaM2: null, deltaMercadoPercent: null,
    etiquetaMercado: 'Por analisar', ratingMercado: 'indefinido',
    contacto: 'Não contactado', fotos: 'Sem fotos', fase: 'Nova lead',
    prioridade: 'Média', assignedTo: 'Hugo', modeloNegocio: 'Wholetailing',
    dataEntrada: now.toISOString().slice(0, 10), isDemo: false,
    requalificacaoNotas: notes,
    notas: { create: { id: `${id}-site`, author: 'Formulário do site', assignedUser: 'Hugo', date: now.toISOString(), text: notes, type: 'general', pinned: true, leadTitle: `${d.nomeProprietario} · ${d.localizacao}` } }
  };
}

export async function saveSubmission(db: any, submission: ReturnType<typeof validateSubmission>) {
  // A serializable transaction keeps retries and simultaneous requests from duplicating records.
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await db.$transaction(async (tx: any) => {
        const existing = await tx.lead.findUnique({ where: { id: submission.id }, select: { id: true } });
        if (existing) return { accepted: true, reference: existing.id, repeated: true };
        const since = new Date(Date.now() - 60 * 60 * 1000);
        const recent = { id: { startsWith: 'lp-' }, createdAt: { gte: since } };
        const phoneCount = await tx.lead.count({ where: { ...recent, telefone: submission.data.telefone } });
        if (phoneCount >= 3) throw new IntakeError(429, 'Já recebemos vários pedidos com este número. Tente mais tarde.');
        const total = await tx.lead.count({ where: recent });
        if (total >= 100) throw new IntakeError(429, 'Há muitos pedidos neste momento. Tente dentro de alguns minutos.');
        const saved = await tx.lead.create({ data: leadRecord(submission), select: { id: true } });
        return { accepted: true, reference: saved.id, repeated: false };
      }, { isolationLevel: 'Serializable', maxWait: 5000, timeout: 10000 });
    } catch (error: any) {
      if (['P2034', 'P2002'].includes(error?.code) && attempt < 2) continue;
      throw error;
    }
  }
}
