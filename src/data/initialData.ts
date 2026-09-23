import { Lead, Visit, Proposal, Note, DealOperation } from '../types/crm';

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-olga-costa',
    nomeProprietario: 'Olga Costa',
    telefone: '+351 914 235 678',
    freguesia: 'Aveiro Centro (Glória e Vera Cruz)',
    concelho: 'Aveiro',
    moradaZona: 'Glória e Vera Cruz, Aveiro',
    tipoImovel: 'Apartamento',
    estadoImovel: 'Habitável a precisar de modernização',
    origem: 'Marketplace',
    valorMinimoAbsoluto: 200000,
    flexibilidade: 'Sim',
    prazoPretendido: 'Curto prazo',
    margemPotencial: 35000,
    ratingMercado: 'medio',
    etiquetaMercado: '60/100 · B',
    contacto: 'Contactado',
    fotos: 'Sem fotos',
    fase: 'Nova lead',
    prioridade: 'Média',
    assignedTo: 'Queirós',
    dataEntrada: '2026-09-22',
    notas: [
      {
        id: 'note-olga-1',
        author: 'Queirós',
        assignedUser: 'Queirós',
        date: '2026-09-22T09:00:00.000Z',
        text: 'Score: 60/100 · B | Mínimo: 200.000 €; anterior pedido: 220.000 €. Dados em falta para definir preço seguro. Prioridade: confirmar área privativa e fotos. A descida de 220 mil para 200 mil não prova desconto face ao mercado.',
        leadId: 'lead-olga-costa',
        leadTitle: 'Olga Costa - Apartamento',
        pinned: true
      }
    ]
  },
  {
    id: 'lead-luis-filipe',
    nomeProprietario: 'Luis Filipe Afonso do Nascimento',
    telefone: '+351 962 441 890',
    freguesia: 'Aradas',
    concelho: 'Aveiro',
    moradaZona: 'Aradas, Aveiro',
    tipoImovel: 'Moradia',
    estadoImovel: 'Habitável a precisar de modernização',
    origem: 'Meta Ads',
    valorMinimoAbsoluto: 347000,
    flexibilidade: 'Não',
    prazoPretendido: 'Sem pressa',
    margemPotencial: 25000,
    ratingMercado: 'medio',
    etiquetaMercado: '45/100 · B',
    contacto: 'Contactado',
    fotos: 'Fotos recebidas',
    fase: 'Nova lead',
    prioridade: 'Média',
    assignedTo: 'Hugo',
    dataEntrada: '2026-09-22',
    notas: [
      {
        id: 'note-luis-1',
        author: 'Hugo',
        assignedUser: 'Hugo',
        date: '2026-09-22T09:15:00.000Z',
        text: 'Score: 45/100 · B | Mínimo: dados em falta. Pedido: 347.000 €. 331 200 € menos custos totais e reserva; cenário condicionado. Boa candidata a visita documental; procurar entrada abaixo do teto condicional e confirmar obras leves.',
        leadId: 'lead-luis-filipe',
        leadTitle: 'Luis Filipe Afonso do Nascimento - Moradia',
        pinned: true
      }
    ]
  },
  {
    id: 'lead-conceicao-bilho',
    nomeProprietario: 'Conceição Bilhó',
    telefone: '+351 931 552 119',
    freguesia: 'Esgueira',
    concelho: 'Aveiro',
    moradaZona: 'Esgueira, Aveiro',
    tipoImovel: 'Ruína',
    estadoImovel: 'A necessitar de obras profundas',
    origem: 'Grupo Facebook',
    valorMinimoAbsoluto: 70000,
    flexibilidade: 'Não',
    prazoPretendido: 'Curto prazo',
    margemPotencial: 18000,
    ratingMercado: 'fraco',
    etiquetaMercado: '40/100 · B',
    contacto: 'Contactado',
    fotos: 'Fotos pedidas',
    fase: 'CPCV a preparar',
    prioridade: 'Baixa',
    assignedTo: 'Hugo',
    dataEntrada: '2026-09-22',
    notas: [
      {
        id: 'note-conceicao-1',
        author: 'Hugo',
        assignedUser: 'Hugo',
        date: '2026-09-22T09:30:00.000Z',
        text: 'Score: 40/100 · B | Mínimo: dados em falta. Pedido: 70.000 €. Dados em falta para definir preço seguro. Prioridade de informação, não aprovação: verificar se é o anúncio existente e pedir fotos. Se for o próprio, 70 mil está perto do preço público.',
        leadId: 'lead-conceicao-bilho',
        leadTitle: 'Conceição Bilhó - Ruína',
        pinned: true
      }
    ]
  },
  {
    id: 'lead-keila-lima',
    nomeProprietario: 'Keila Lima',
    telefone: '+351 925 883 402',
    freguesia: 'Oliveirinha',
    concelho: 'Aveiro',
    moradaZona: 'Oliveirinha, Aveiro',
    tipoImovel: 'Apartamento',
    estadoImovel: 'A necessitar de obras profundas',
    origem: 'Marketplace',
    valorMinimoAbsoluto: 99000,
    flexibilidade: 'Não',
    prazoPretendido: 'Curto prazo',
    margemPotencial: 22000,
    ratingMercado: 'fraco',
    etiquetaMercado: '40/100 · B',
    contacto: 'Contactado',
    fotos: 'Fotos pedidas',
    fase: 'Nova lead',
    prioridade: 'Baixa',
    assignedTo: 'Queirós',
    dataEntrada: '2026-09-22',
    notas: [
      {
        id: 'note-keila-1',
        author: 'Queirós',
        assignedUser: 'Queirós',
        date: '2026-09-22T09:45:00.000Z',
        text: 'Score: 40/100 · B | Mínimo: dados em falta. Pedido: 99.000 €. Dados em falta para definir preço seguro. Prioridade: fotos interiores/exteriores e plantas. Ticket baixo interessa, mas ainda não permite teto de entrada sustentado.',
        leadId: 'lead-keila-lima',
        leadTitle: 'Keila Lima - Apartamento',
        pinned: true
      }
    ]
  },
  {
    id: 'lead-paulo-lopes',
    nomeProprietario: 'Paulo Lopes',
    telefone: '+351 918 334 771',
    freguesia: 'Ílhavo (São Salvador)',
    concelho: 'Ílhavo',
    moradaZona: 'São Salvador, Ílhavo',
    tipoImovel: 'Apartamento',
    estadoImovel: 'Habitável a precisar de modernização',
    origem: 'Prospeção direta',
    valorMinimoAbsoluto: 280000,
    flexibilidade: 'Sim',
    prazoPretendido: 'Curto prazo',
    margemPotencial: 32000,
    ratingMercado: 'fraco',
    etiquetaMercado: '40/100 · B',
    contacto: 'Contactado',
    fotos: 'Fotos pedidas',
    fase: 'Nova lead',
    prioridade: 'Média',
    assignedTo: 'Queirós',
    dataEntrada: '2026-09-22',
    notas: [
      {
        id: 'note-paulo-1',
        author: 'Queirós',
        assignedUser: 'Queirós',
        date: '2026-09-22T10:00:00.000Z',
        text: 'Score: 40/100 · B | Mínimo: 280.000 €. 248 000 € menos custos totais e reserva; cenário condicionado. Prioridade: obter anúncio, planta e freguesia. Cenário de entrada apenas se equivalente ao duplex de São Salvador.',
        leadId: 'lead-paulo-lopes',
        leadTitle: 'Paulo Lopes - Apartamento Duplex',
        pinned: true
      }
    ]
  }
];

export const INITIAL_VISITS: Visit[] = [];
export const INITIAL_PROPOSALS: Proposal[] = [
  {
    id: 'prop-1790125953822',
    leadId: 'lead-conceicao-bilho',
    nomeProprietario: 'Conceição Bilhó',
    moradaConcelhoFreguesia: 'Esgueira',
    valorMinimoAbsoluto: 70000,
    valorProposta: 35000,
    valorSinal: 3500,
    valorRevenda: 88000,
    margemPrevista: 53000,
    spread: 60.2,
    multiploSinal: 15.1,
    dataEnvio: '2026-09-23',
    estado: 'Aceite',
    assignedUser: 'Queirós'
  }
];
export const INITIAL_NOTES: Note[] = INITIAL_LEADS.flatMap(l => l.notas || []);
export const INITIAL_OPERATIONS: DealOperation[] = [
  {
    id: 'op-1790125967662',
    leadId: 'lead-conceicao-bilho',
    proposalId: 'prop-1790125953822',
    nomeProprietario: 'Conceição Bilhó',
    freguesia: 'Esgueira',
    tipoImovel: 'Ruína',
    valorCompraAcordado: 35000,
    valorSinalPago: 3500,
    valorRevendaAlvo: 88000,
    margemPrevista: 53000,
    multiploSinal: 15.1,
    fase: 'Validacao_Facebook',
    responsavel: 'Queirós',
    dataAceitacao: '2026-09-23',
    checklist: {
      anuncioCriadoFacebook: true,
      leadsInteresseRecebidas: false,
      compradorIdentificado: false,
      sinalPago10: false
    },
    historicoNotas: [],
    notas: 'Proposta aceite em 2026-09-23. Teste de interesse no Facebook em curso.'
  }
];
