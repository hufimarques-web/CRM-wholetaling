export type AppUser = 'Queirós' | 'Hugo';

export type PropertyType = 'Terreno' | 'Ruína' | 'Apartamento' | 'Moradia' | 'Prédio' | 'Outro';

export type PropertyCondition =
  | 'Ruína total'
  | 'A necessitar de obras profundas'
  | 'Habitável a precisar de modernização'
  | 'Bom estado geral'
  | 'Terreno limpo e plano'
  | 'Terreno com declive / árvores';

export type LeadOrigin = 'Meta Ads' | 'Marketplace' | 'Grupo Facebook' | 'Prospeção direta' | 'Referência' | 'Outro';

export type ContactStatus = 'Não contactado' | 'Contactado' | 'Sem resposta' | 'Reunião marcada';

export type PhotoStatus = 'Sem fotos' | 'Fotos pedidas' | 'Fotos recebidas';

export type LeadPhase = 'Nova lead' | 'Em análise' | 'Descartada' | 'Pronta para proposta' | 'CPCV a preparar';

export type PriorityLevel = 'Baixa' | 'Média' | 'Alta' | 'Urgente';

export type YesNo = 'Sim' | 'Não';

export type DealDeadline = 'Imediatamente' | 'Curto prazo' | 'Sem pressa';

export type CallResult = 'Contactado' | 'Sem resposta' | 'Voltar a ligar';

export type MarketDealRating = 'ouro' | 'bom' | 'medio' | 'fraco' | 'indefinido';

export interface Note {
  id: string;
  author: string;
  assignedUser?: AppUser;
  date: string; // ISO String
  text: string;
  type?: 'general' | 'call';
  callResult?: CallResult;
  nextContactDate?: string;
  leadId?: string;
  leadTitle?: string;
  pinned?: boolean;
}

export interface Lead {
  id: string;
  // Owner / Contact
  nomeProprietario: string;
  telefone: string;
  email?: string;
  
  // Location (Aveiro District)
  freguesia: string;
  concelho?: string;
  moradaZona?: string;

  // Property Details
  tipoImovel: PropertyType;
  estadoImovel: PropertyCondition;
  areaM2?: number;
  origem: LeadOrigin;

  // Values & Terms (Only Min. Absoluto)
  valorMinimoAbsoluto: number;
  flexibilidade: YesNo;
  prazoPretendido: DealDeadline;
  margemPotencial: number; // Automatic: based on parish benchmark resale - minAbsoluto

  // Market Study Auto-Calculated (Aveiro Database)
  precoM2?: number;
  mediaFreguesiaM2?: number;
  deltaMercadoPercent?: number;
  etiquetaMercado?: string;
  ratingMercado?: MarketDealRating;

  // Independent States
  contacto: ContactStatus;
  fotos: PhotoStatus;
  fase: LeadPhase;
  prioridade: PriorityLevel;

  // User Assignment (Locked to active session user upon creation)
  assignedTo: AppUser;

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
  nomeProprietario: string;
  moradaZona?: string;
  concelhoFreguesia: string;
  
  data: string; // YYYY-MM-DD
  hora: string; // HH:mm
  responsavel: string;
  assignedUser: AppUser;
  estado: VisitState;
  notas?: string;
  resultado: VisitResult;
  realizadaEm?: string;
}

export type ProposalState = 'Enviada' | 'Em negociação' | 'Aceite' | 'Recusada' | 'Expirada';

export interface Proposal {
  id: string;
  leadId: string;
  nomeProprietario: string;
  moradaConcelhoFreguesia: string;
  valorMinimoAbsoluto: number;

  // Proposal Calculations
  valorProposta: number;
  valorSinal: number; // Down payment / Investimento (default 10%, editable)
  valorRevenda: number; // Estimated Resale Value
  margemPrevista: number; // Automatic: valorRevenda - valorProposta
  spread: number; // Automatic: (margemPrevista / valorRevenda) * 100
  multiploSinal: number; // Automatic: margemPrevista / valorSinal (ex: 5.8x)

  dataEnvio: string; // YYYY-MM-DD
  estado: ProposalState;
  assignedUser: AppUser;
  proximoFollowUp?: string; // YYYY-MM-DD
  notas?: string;
}

// -------------------------------------------------------------
// OPERAÇÕES & PÓS-ACEITAÇÃO (Validação Facebook -> CPCV -> Venda)
// -------------------------------------------------------------
export type OperationStage =
  | 'Validacao_Facebook'
  | 'CPCV_Assinado'
  | 'Venda_Fechada'
  | 'Cancelado';

export interface DocumentChecklist {
  anuncioCriadoFacebook?: boolean;
  leadsInteresseRecebidas?: boolean;
  compradorIdentificado?: boolean;
  sinalPago10?: boolean;
  // Legacy / optional technical checks
  certidaoPermanente?: boolean;
  cadernetaPredial?: boolean;
  licencaUtilizacao?: boolean;
  levantamentoTopografico?: boolean;
}

export interface OperationNote {
  id: string;
  author: AppUser;
  text: string;
  date: string;
}

export interface DealOperation {
  id: string;
  leadId: string;
  proposalId?: string;
  nomeProprietario: string;
  freguesia: string;
  tipoImovel: PropertyType;
  areaM2?: number;

  // Financial terms
  valorCompraAcordado: number;
  valorSinalPago: number; // 10% sinal
  valorRevendaAlvo: number;
  margemPrevista: number;
  multiploSinal: number;

  // Stage & Ownership
  fase: OperationStage;
  responsavel: AppUser;
  
  // Dates
  dataAceitacao: string; // YYYY-MM-DD
  dataAssinaturaCPCV?: string;
  dataLimiteEscritura?: string; // Deadline for closing / assigning
  dataVendaFechada?: string;

  // Investor / Buyer
  compradorNome?: string;
  compradorTelefone?: string;
  valorVendaRealizado?: number;
  lucroRealizado?: number;

  // Operational Checklist & Notes
  checklist: DocumentChecklist;
  historicoNotas?: OperationNote[];
  notas?: string;
}

export interface LeadFilterOptions {
  searchQuery: string;
  fase?: LeadPhase | 'Todas';
  contacto?: ContactStatus | 'Todos';
  fotos?: PhotoStatus | 'Todas';
  prioridade?: PriorityLevel | 'Todas';
  flexibilidade?: YesNo | 'Todas';
  freguesia?: string | 'Todas';
  assignedTo?: AppUser | 'Todos';
  ratingMercado?: MarketDealRating | 'Todas';
}
