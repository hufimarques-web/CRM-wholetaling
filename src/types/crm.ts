export type PropertyType = 'Terreno' | 'Ruína' | 'Apartamento' | 'Moradia' | 'Prédio' | 'Outro';

export type LeadOrigin = 'Meta Ads' | 'Marketplace' | 'Grupo Facebook' | 'Prospeção direta' | 'Referência' | 'Outro';

export type ContactStatus = 'Não contactado' | 'Contactado' | 'Sem resposta' | 'Reunião marcada';

export type PhotoStatus = 'Sem fotos' | 'Fotos pedidas' | 'Fotos recebidas';

export type LeadPhase = 'Nova lead' | 'Em análise' | 'Descartada' | 'Pronta para proposta' | 'CPCV a preparar';

export type PriorityLevel = 'Baixa' | 'Média' | 'Alta' | 'Urgente';

export type YesNo = 'Sim' | 'Não';

export type CallResult = 'Contactado' | 'Sem resposta' | 'Voltar a ligar';

export interface Note {
  id: string;
  author: string;
  date: string; // ISO String
  text: string;
  type?: 'general' | 'call';
  callResult?: CallResult;
  nextContactDate?: string;
}

export interface Lead {
  id: string;
  // Owner / Contact
  nomeProprietario: string;
  telefone: string;
  email?: string;
  
  // Location
  moradaZona: string;
  concelho: string;
  freguesia: string;

  // Property Details
  tipoImovel: PropertyType;
  situacaoAtual: string; // Mandatory Q1
  areaM2?: number; // Mandatory Q4
  origem: LeadOrigin;

  // Values & Terms
  precoPedido?: number;
  valorMinimoAbsoluto: number; // Mandatory Q5
  flexibilidade: YesNo; // Mandatory Q6
  prazoPretendido: string; // Mandatory Q2
  valorEstimadoAvaliacao?: number;
  margemPotencial: number; // Automatic: valorEstimadoAvaliacao - valorMinimoAbsoluto

  // Independent States
  contacto: ContactStatus;
  fotos: PhotoStatus;
  fase: LeadPhase;
  prioridade: PriorityLevel;

  // Timestamps & Meta
  dataEntrada: string; // YYYY-MM-DD
  notas: Note[];
  isDemo?: boolean;
}

export type VisitState = 'Marcada' | 'Confirmada' | 'Realizada' | 'Cancelada' | 'Reagendar';

export type VisitResult = 'Ainda por avaliar' | 'Interessante' | 'Não interessante' | 'Pronta para proposta';

export interface Visit {
  id: string;
  leadId: string;
  // Inherited/Snapshotted from lead for quick view
  nomeProprietario: string;
  moradaZona: string;
  concelhoFreguesia: string;
  
  data: string; // YYYY-MM-DD
  hora: string; // HH:mm
  responsavel: string;
  estado: VisitState;
  notas?: string;
  resultado: VisitResult;
}

export type ProposalState = 'Enviada' | 'Em negociação' | 'Aceite' | 'Recusada' | 'Expirada';

export interface Proposal {
  id: string;
  leadId: string;
  // Inherited info
  nomeProprietario: string;
  moradaConcelhoFreguesia: string;
  precoPedido?: number;
  valorMinimoAbsoluto: number;

  // Proposal Calculations
  valorProposta: number;
  valorRevenda: number; // Estimated Resale Value
  margemPrevista: number; // Automatic: valorRevenda - valorProposta
  spread: number; // Automatic: (margemPrevista / valorRevenda) * 100

  dataEnvio: string; // YYYY-MM-DD
  estado: ProposalState;
  proximoFollowUp?: string; // YYYY-MM-DD
  notas?: string;
}

export interface LeadFilterOptions {
  searchQuery: string;
  fase?: LeadPhase | 'Todas';
  contacto?: ContactStatus | 'Todos';
  fotos?: PhotoStatus | 'Todas';
  prioridade?: PriorityLevel | 'Todas';
  flexibilidade?: YesNo | 'Todas';
  concelho?: string | 'Todos';
}
