import React, { createContext, useContext, useState, useEffect } from 'react';
import { Lead, Visit, Proposal, LeadPhase, ContactStatus, Note, CallResult, AppUser, DealOperation, OperationStage, DocumentChecklist, OperationNote } from '../types/crm';
import { INITIAL_LEADS, INITIAL_VISITS, INITIAL_PROPOSALS, INITIAL_NOTES, INITIAL_OPERATIONS } from '../data/initialData';
import { analyzeLeadMarket } from '../data/marketData';
import { calcLeadPotentialMargin, calcProposalMargin, calcProposalSpread, calcDefaultSinal, calcProposalMultiple } from '../utils/formatters';

interface LeadDeleteImpact {
  lead: Lead;
  visitCount: number;
  proposalCount: number;
}

interface AddCallNoteParams {
  leadId: string;
  text: string;
  callResult: CallResult;
  date: string;
  nextContactDate?: string;
}

interface CRMContextType {
  // Authentication & Session
  isAuthenticated: boolean;
  currentUser: AppUser;
  setCurrentUser: (user: AppUser) => void;
  login: (user: AppUser) => void;
  logout: () => void;

  // Navigation & Search
  activeTab: 'dashboard' | 'leads' | 'calendar' | 'proposals' | 'notes' | 'operations' | 'discarded';
  setActiveTab: (tab: 'dashboard' | 'leads' | 'calendar' | 'proposals' | 'notes' | 'operations' | 'discarded') => void;
  leadViewMode: 'funnel' | 'table';
  setLeadViewMode: (mode: 'funnel' | 'table') => void;
  globalSearch: string;
  setGlobalSearch: (query: string) => void;
  
  // Data States
  leads: Lead[];
  visits: Visit[];
  proposals: Proposal[];
  notes: Note[];
  operations: DealOperation[];

  // Modals & Drawer state triggers
  selectedLeadForDrawer: Lead | null;
  setSelectedLeadForDrawer: (lead: Lead | null) => void;
  isLeadFormOpen: boolean;
  setIsLeadFormOpen: (open: boolean) => void;
  editingLead: Lead | null;
  setEditingLead: (lead: Lead | null) => void;
  
  // Call Modal State
  isCallModalOpen: boolean;
  setIsCallModalOpen: (open: boolean) => void;
  callModalLeadId: string | null;
  setCallModalLeadId: (leadId: string | null) => void;
  openCallModal: (leadId: string) => void;

  // Visit Modal State
  isVisitFormOpen: boolean;
  setIsVisitFormOpen: (open: boolean) => void;
  preselectedVisitLeadId: string | null;
  setPreselectedVisitLeadId: (leadId: string | null) => void;
  editingVisit: Visit | null;
  setEditingVisit: (visit: Visit | null) => void;
  
  // Proposal Modal State
  isProposalFormOpen: boolean;
  setIsProposalFormOpen: (open: boolean) => void;
  preselectedProposalLeadId: string | null;
  setPreselectedProposalLeadId: (leadId: string | null) => void;
  editingProposal: Proposal | null;
  setEditingProposal: (proposal: Proposal | null) => void;
  
  // AI Deal Assistant Modal State
  isAIModalOpen: boolean;
  setIsAIModalOpen: (open: boolean) => void;
  aiTargetLead: Lead | null;
  setAITargetLead: (lead: Lead | null) => void;
  openAIAnalysis: (lead: Lead) => void;

  // Delete confirm state
  deleteImpactModal: LeadDeleteImpact | null;
  setDeleteImpactModal: (impact: LeadDeleteImpact | null) => void;

  // Actions
  addLead: (leadData: Omit<Lead, 'id' | 'dataEntrada' | 'margemPotencial' | 'notas' | 'assignedTo'> & { notas?: Note[] }) => Lead;
  updateLead: (lead: Lead) => void;
  requestDeleteLead: (leadId: string) => void;
  confirmDeleteLead: (leadId: string) => void;
  updateLeadPhase: (leadId: string, newPhase: LeadPhase) => void;
  discardLead: (leadId: string, reason?: string) => void;
  restoreLead: (leadId: string, targetPhase?: LeadPhase) => void;
  addNoteToLead: (leadId: string, text: string) => void;
  addCallNoteToLead: (params: AddCallNoteParams) => void;

  // Notes Actions
  addNote: (noteData: Omit<Note, 'id' | 'date' | 'author' | 'assignedUser'> & { date?: string }) => Note;
  updateNote: (note: Note) => void;
  deleteNote: (noteId: string) => void;
  togglePinNote: (noteId: string) => void;

  // Visits Actions
  addVisit: (visitData: Omit<Visit, 'id' | 'nomeProprietario' | 'moradaZona' | 'concelhoFreguesia' | 'responsavel' | 'assignedUser'>) => Visit;
  updateVisit: (visit: Visit) => void;
  deleteVisit: (visitId: string) => void;
  toggleVisitRealizada: (visitId: string) => void;

  // Proposals Actions
  addProposal: (proposalData: Omit<Proposal, 'id' | 'nomeProprietario' | 'moradaConcelhoFreguesia' | 'margemPrevista' | 'spread' | 'multiploSinal' | 'assignedUser'> & { valorSinal?: number }) => Proposal;
  updateProposal: (proposal: Proposal) => void;
  deleteProposal: (proposalId: string) => void;
  acceptProposal: (proposalId: string) => void;

  // Operations Actions (Pós-Aceitação / Do CPCV à Venda)
  addOperation: (opData: Omit<DealOperation, 'id'>) => DealOperation;
  updateOperation: (op: DealOperation) => void;
  updateOperationStage: (opId: string, stage: OperationStage) => void;
  toggleChecklistDoc: (opId: string, docKey: keyof DocumentChecklist) => void;
  deleteOperation: (opId: string) => void;
  addOperationNote: (opId: string, text: string) => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

const getSafeLocalStorage = (key: string): string | null => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const setSafeLocalStorage = (key: string, value: string) => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch {}
};

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return getSafeLocalStorage('wt_crm_auth') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<AppUser>(() => {
    const saved = getSafeLocalStorage('wt_crm_current_user');
    if (saved === 'Queirós' || saved === 'Hugo') return saved;
    return 'Queirós';
  });

  const login = (user: AppUser) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setSafeLocalStorage('wt_crm_current_user', user);
    setSafeLocalStorage('wt_crm_auth', 'true');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setSafeLocalStorage('wt_crm_auth', 'false');
  };

  // Navigation & Search
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leads' | 'calendar' | 'proposals' | 'notes' | 'operations' | 'discarded'>('dashboard');
  const [leadViewMode, setLeadViewMode] = useState<'funnel' | 'table'>('funnel');
  const [globalSearch, setGlobalSearch] = useState('');

  // Main Data States with LocalStorage Initialization (SSR Safe)
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = getSafeLocalStorage('wt_crm_leads');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { console.error(e); }
    }
    return INITIAL_LEADS;
  });

  const [visits, setVisits] = useState<Visit[]>(() => {
    const saved = getSafeLocalStorage('wt_crm_visits');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_VISITS;
  });

  const [proposals, setProposals] = useState<Proposal[]>(() => {
    const saved = getSafeLocalStorage('wt_crm_proposals');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_PROPOSALS;
  });

  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = getSafeLocalStorage('wt_crm_notes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { console.error(e); }
    }
    return INITIAL_NOTES;
  });

  const [operations, setOperations] = useState<DealOperation[]>(() => {
    const saved = getSafeLocalStorage('wt_crm_operations');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_OPERATIONS;
  });

  // Modal / Drawer Controls
  const [selectedLeadForDrawer, setSelectedLeadForDrawer] = useState<Lead | null>(null);
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Call Modal State
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [callModalLeadId, setCallModalLeadId] = useState<string | null>(null);

  const [isVisitFormOpen, setIsVisitFormOpen] = useState(false);
  const [preselectedVisitLeadId, setPreselectedVisitLeadId] = useState<string | null>(null);
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);

  const [isProposalFormOpen, setIsProposalFormOpen] = useState(false);
  const [preselectedProposalLeadId, setPreselectedProposalLeadId] = useState<string | null>(null);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);

  // AI Deal Assistant
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiTargetLead, setAITargetLead] = useState<Lead | null>(null);

  const [deleteImpactModal, setDeleteImpactModal] = useState<LeadDeleteImpact | null>(null);

  // Load from Prisma via Next.js API bootstrap
  useEffect(() => {
    fetch('/api/bootstrap')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.leads) && data.leads.length > 0) {
          setLeads(data.leads);
        } else if (INITIAL_LEADS.length > 0) {
          const saved = getSafeLocalStorage('wt_crm_leads');
          if (!saved || saved === '[]') {
            setLeads(INITIAL_LEADS);
          }
        }
        if (data) {
          if (Array.isArray(data.visits)) setVisits(data.visits);
          if (Array.isArray(data.proposals)) setProposals(data.proposals);
          if (Array.isArray(data.notes) && data.notes.length > 0) {
            setNotes(data.notes);
          } else if (INITIAL_NOTES.length > 0) {
            const savedNotes = getSafeLocalStorage('wt_crm_notes');
            if (!savedNotes || savedNotes === '[]') {
              setNotes(INITIAL_NOTES);
            }
          }
          if (Array.isArray(data.operations)) setOperations(data.operations);
        }
      })
      .catch(err => console.warn('Prisma bootstrap loaded offline/local fallback:', err));
  }, []);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('wt_crm_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('wt_crm_visits', JSON.stringify(visits));
  }, [visits]);

  useEffect(() => {
    localStorage.setItem('wt_crm_proposals', JSON.stringify(proposals));
  }, [proposals]);

  useEffect(() => {
    localStorage.setItem('wt_crm_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('wt_crm_operations', JSON.stringify(operations));
  }, [operations]);

  useEffect(() => {
    if (selectedLeadForDrawer) {
      const updated = leads.find(l => l.id === selectedLeadForDrawer.id);
      if (updated) setSelectedLeadForDrawer(updated);
    }
  }, [leads]);

  const openCallModal = (leadId: string) => {
    setCallModalLeadId(leadId);
    setIsCallModalOpen(true);
  };

  const openAIAnalysis = (lead: Lead) => {
    setAITargetLead(lead);
    setIsAIModalOpen(true);
  };

  // LEAD ACTIONS
  const addLead = (leadData: Omit<Lead, 'id' | 'dataEntrada' | 'margemPotencial' | 'notas' | 'assignedTo'> & { notas?: Note[] }): Lead => {
    const id = 'lead-' + Date.now();
    const dataEntrada = new Date().toISOString().split('T')[0];
    
    // Automatic Aveiro parish market benchmark study
    const precoM2 = leadData.areaM2 && leadData.areaM2 > 0
      ? Math.round(leadData.valorMinimoAbsoluto / leadData.areaM2)
      : undefined;
    const margemPotencial = Math.round(leadData.valorMinimoAbsoluto * 0.30);

    // Locked to session active user!
    const newLead: Lead = {
      ...leadData,
      id,
      dataEntrada,
      margemPotencial,
      assignedTo: currentUser,
      precoM2,
      notas: leadData.notas || []
    };

    setLeads(prev => [newLead, ...prev]);
    return newLead;
  };

  const updateLead = (updatedLead: Lead) => {
    const precoM2 = updatedLead.areaM2 && updatedLead.areaM2 > 0
      ? Math.round(updatedLead.valorMinimoAbsoluto / updatedLead.areaM2)
      : undefined;
    const margemPotencial = Math.round(updatedLead.valorMinimoAbsoluto * 0.30);

    const finalLead: Lead = {
      ...updatedLead,
      precoM2,
      margemPotencial,
      deltaMercadoPercent: undefined,
      etiquetaMercado: undefined,
      ratingMercado: undefined,
      mediaFreguesiaM2: undefined
    };

    setLeads(prev => prev.map(l => l.id === finalLead.id ? finalLead : l));
  };

  const updateLeadPhase = (leadId: string, newPhase: LeadPhase) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, fase: newPhase } : l));
    fetch(`/api/leads/${leadId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fase: newPhase })
    }).catch(err => console.warn('Prisma phase sync error:', err));
  };

  const discardLead = (leadId: string, reason?: string) => {
    if (reason && reason.trim()) {
      addNoteToLead(leadId, `Motivo de Descarte: ${reason.trim()}`);
    }
    updateLeadPhase(leadId, 'Descartada');
  };

  const restoreLead = (leadId: string, targetPhase: LeadPhase = 'Nova lead') => {
    updateLeadPhase(leadId, targetPhase);
  };

  const addNoteToLead = (leadId: string, text: string) => {
    if (!text.trim()) return;
    const newNote: Note = {
      id: 'note-' + Date.now(),
      author: currentUser,
      assignedUser: currentUser,
      date: new Date().toISOString(),
      text: text.trim(),
      type: 'general',
      leadId
    };

    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          notas: [newNote, ...(l.notas || [])]
        };
      }
      return l;
    }));

    const targetLead = leads.find(l => l.id === leadId);
    setNotes(prev => [
      {
        ...newNote,
        leadTitle: targetLead ? `${targetLead.nomeProprietario} (${targetLead.freguesia})` : undefined
      },
      ...prev
    ]);
  };

  const addCallNoteToLead = ({ leadId, text, callResult, date, nextContactDate }: AddCallNoteParams) => {
    if (!text.trim()) return;
    
    const newNote: Note = {
      id: 'note-call-' + Date.now(),
      author: currentUser,
      assignedUser: currentUser,
      date: date || new Date().toISOString(),
      text: text.trim(),
      type: 'call',
      callResult,
      nextContactDate,
      leadId
    };

    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        let newContactStatus: ContactStatus = l.contacto;
        if (callResult === 'Contactado' && l.contacto !== 'Reunião marcada') {
          newContactStatus = 'Contactado';
        } else if (callResult === 'Sem resposta' && l.contacto !== 'Reunião marcada') {
          newContactStatus = 'Sem resposta';
        } else if (callResult === 'Voltar a ligar' && l.contacto !== 'Reunião marcada') {
          newContactStatus = 'Contactado';
        }

        return {
          ...l,
          contacto: newContactStatus,
          notas: [newNote, ...(l.notas || [])]
        };
      }
      return l;
    }));

    const targetLead = leads.find(l => l.id === leadId);
    setNotes(prev => [
      {
        ...newNote,
        leadTitle: targetLead ? `${targetLead.nomeProprietario} (${targetLead.freguesia})` : undefined
      },
      ...prev
    ]);
  };

  // GENERAL NOTES ACTIONS
  const addNote = (noteData: Omit<Note, 'id' | 'date' | 'author' | 'assignedUser'> & { date?: string }): Note => {
    const newNote: Note = {
      ...noteData,
      id: 'note-' + Date.now(),
      author: currentUser,
      assignedUser: currentUser,
      date: noteData.date || new Date().toISOString()
    };
    setNotes(prev => [newNote, ...prev]);

    if (newNote.leadId) {
      setLeads(prev => prev.map(l => {
        if (l.id === newNote.leadId) {
          return {
            ...l,
            notas: [newNote, ...(l.notas || [])]
          };
        }
        return l;
      }));
    }

    return newNote;
  };

  const updateNote = (updatedNote: Note) => {
    setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
  };

  const deleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
  };

  const togglePinNote = (noteId: string) => {
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, pinned: !n.pinned } : n));
  };

  const requestDeleteLead = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    const assocVisits = visits.filter(v => v.leadId === leadId);
    const assocProposals = proposals.filter(p => p.leadId === leadId);

    setDeleteImpactModal({
      lead,
      visitCount: assocVisits.length,
      proposalCount: assocProposals.length
    });
  };

  const confirmDeleteLead = (leadId: string) => {
    setLeads(prev => prev.filter(l => l.id !== leadId));
    setVisits(prev => prev.filter(v => v.leadId !== leadId));
    setProposals(prev => prev.filter(p => p.leadId !== leadId));
    setNotes(prev => prev.filter(n => n.leadId !== leadId));
    setOperations(prev => prev.filter(o => o.leadId !== leadId));
    setDeleteImpactModal(null);
    if (selectedLeadForDrawer?.id === leadId) {
      setSelectedLeadForDrawer(null);
    }
  };

  // VISIT ACTIONS
  const addVisit = (visitData: Omit<Visit, 'id' | 'nomeProprietario' | 'moradaZona' | 'concelhoFreguesia' | 'responsavel' | 'assignedUser'>): Visit => {
    const lead = leads.find(l => l.id === visitData.leadId);
    const id = 'vis-' + Date.now();

    const newVisit: Visit = {
      ...visitData,
      id,
      nomeProprietario: lead ? lead.nomeProprietario : 'N/A',
      concelhoFreguesia: lead ? lead.freguesia : 'N/A',
      responsavel: currentUser,
      assignedUser: currentUser,
      realizadaEm: visitData.estado === 'Realizada' ? new Date().toISOString() : undefined
    };

    setVisits(prev => [newVisit, ...prev]);

    if (lead) {
      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, contacto: 'Reunião marcada' as ContactStatus } : l));
    }

    return newVisit;
  };

  const updateVisit = (updatedVisit: Visit) => {
    const lead = leads.find(l => l.id === updatedVisit.leadId);
    const finalVisit: Visit = {
      ...updatedVisit,
      nomeProprietario: lead ? lead.nomeProprietario : updatedVisit.nomeProprietario,
      concelhoFreguesia: lead ? lead.freguesia : updatedVisit.concelhoFreguesia
    };

    setVisits(prev => prev.map(v => v.id === finalVisit.id ? finalVisit : v));
  };

  const deleteVisit = (visitId: string) => {
    setVisits(prev => prev.filter(v => v.id !== visitId));
  };

  const toggleVisitRealizada = (visitId: string) => {
    setVisits(prev => prev.map(v => {
      if (v.id === visitId) {
        const isRealizada = v.estado === 'Realizada';
        const newState = isRealizada ? 'Marcada' : 'Realizada';
        return {
          ...v,
          estado: newState,
          realizadaEm: !isRealizada ? new Date().toISOString() : undefined
        };
      }
      return v;
    }));
  };

  // PROPOSAL ACTIONS
  const addProposal = (proposalData: Omit<Proposal, 'id' | 'nomeProprietario' | 'moradaConcelhoFreguesia' | 'margemPrevista' | 'spread' | 'multiploSinal' | 'assignedUser'> & { valorSinal?: number }): Proposal => {
    const lead = leads.find(l => l.id === proposalData.leadId);
    const id = 'prop-' + Date.now();

    const margemPrevista = calcProposalMargin(proposalData.valorRevenda, proposalData.valorProposta);
    const spread = calcProposalSpread(proposalData.valorRevenda, proposalData.valorProposta);
    
    const valorSinal = proposalData.valorSinal !== undefined && proposalData.valorSinal > 0
      ? proposalData.valorSinal
      : calcDefaultSinal(proposalData.valorProposta);
      
    const multiploSinal = calcProposalMultiple(margemPrevista, valorSinal);

    const newProposal: Proposal = {
      ...proposalData,
      id,
      nomeProprietario: lead ? lead.nomeProprietario : 'N/A',
      moradaConcelhoFreguesia: lead ? lead.freguesia : 'N/A',
      valorSinal,
      margemPrevista,
      spread,
      multiploSinal,
      assignedUser: currentUser
    };

    setProposals(prev => [newProposal, ...prev]);

    if (lead && lead.fase === 'Nova lead') {
      updateLeadPhase(lead.id, 'Em análise');
    }

    return newProposal;
  };

  const updateProposal = (updatedProposal: Proposal) => {
    const lead = leads.find(l => l.id === updatedProposal.leadId);
    const margemPrevista = calcProposalMargin(updatedProposal.valorRevenda, updatedProposal.valorProposta);
    const spread = calcProposalSpread(updatedProposal.valorRevenda, updatedProposal.valorProposta);
    const valorSinal = updatedProposal.valorSinal > 0 ? updatedProposal.valorSinal : calcDefaultSinal(updatedProposal.valorProposta);
    const multiploSinal = calcProposalMultiple(margemPrevista, valorSinal);

    const finalProposal: Proposal = {
      ...updatedProposal,
      nomeProprietario: lead ? lead.nomeProprietario : updatedProposal.nomeProprietario,
      moradaConcelhoFreguesia: lead ? lead.freguesia : updatedProposal.moradaConcelhoFreguesia,
      valorSinal,
      margemPrevista,
      spread,
      multiploSinal
    };

    setProposals(prev => prev.map(p => p.id === finalProposal.id ? finalProposal : p));
  };

  const deleteProposal = (proposalId: string) => {
    setProposals(prev => prev.filter(p => p.id !== proposalId));
  };

  const acceptProposal = (proposalId: string) => {
    const prop = proposals.find(p => p.id === proposalId);
    if (!prop) return;

    setProposals(prev => prev.map(p => p.id === proposalId ? { ...p, estado: 'Aceite' } : p));

    if (prop.leadId) {
      updateLeadPhase(prop.leadId, 'CPCV a preparar');
      addNoteToLead(prop.leadId, `Proposta de ${prop.valorProposta} € aceite! Negócio encaminhado para formalização de CPCV.`);
      
      // Auto-create post-acceptance Deal Operation if not already created
      const existingOp = operations.find(o => o.proposalId === proposalId || o.leadId === prop.leadId);
      if (!existingOp) {
        const lead = leads.find(l => l.id === prop.leadId);
        const newOp: DealOperation = {
          id: 'op-' + Date.now(),
          leadId: prop.leadId,
          proposalId: prop.id,
          nomeProprietario: prop.nomeProprietario,
          freguesia: lead ? lead.freguesia : 'Aveiro',
          tipoImovel: lead ? lead.tipoImovel : 'Moradia',
          areaM2: lead?.areaM2,
          valorCompraAcordado: prop.valorProposta,
          valorSinalPago: prop.valorSinal,
          valorRevendaAlvo: prop.valorRevenda,
          margemPrevista: prop.margemPrevista,
          multiploSinal: prop.multiploSinal,
          fase: 'Validacao_Facebook',
          responsavel: currentUser,
          dataAceitacao: new Date().toISOString().split('T')[0],
          checklist: {
            anuncioCriadoFacebook: true,
            leadsInteresseRecebidas: false,
            compradorIdentificado: false,
            sinalPago10: false
          },
          historicoNotas: [
            {
              id: 'on-' + Date.now(),
              author: currentUser,
              text: `Proposta de ${prop.valorProposta} € aceite por ${currentUser}. Negócio colocado em validação de interesse no Facebook.`,
              date: new Date().toISOString()
            }
          ],
          notas: `Proposta aceite em ${new Date().toISOString().split('T')[0]}. Teste de interesse no Facebook em curso.`
        };
        setOperations(prev => [newOp, ...prev]);
      }
    }
  };

  // OPERATIONS ACTIONS (Pós-Aceitação / Do CPCV até à Venda)
  const addOperation = (opData: Omit<DealOperation, 'id'>): DealOperation => {
    const id = 'op-' + Date.now();
    const newOp: DealOperation = {
      ...opData,
      id
    };
    setOperations(prev => [newOp, ...prev]);
    return newOp;
  };

  const updateOperation = (updatedOp: DealOperation) => {
    setOperations(prev => prev.map(o => o.id === updatedOp.id ? updatedOp : o));
  };

  const updateOperationStage = (opId: string, stage: OperationStage) => {
    setOperations(prev => prev.map(o => {
      if (o.id === opId) {
        const updates: Partial<DealOperation> = { fase: stage };
        if (stage === 'CPCV_Assinado' && !o.dataAssinaturaCPCV) {
          updates.dataAssinaturaCPCV = new Date().toISOString().split('T')[0];
        }
        if (stage === 'Venda_Fechada' && !o.dataVendaFechada) {
          updates.dataVendaFechada = new Date().toISOString().split('T')[0];
          updates.lucroRealizado = o.valorVendaRealizado ? (o.valorVendaRealizado - o.valorCompraAcordado) : o.margemPrevista;
        }
        return { ...o, ...updates };
      }
      return o;
    }));
  };

  const toggleChecklistDoc = (opId: string, docKey: keyof DocumentChecklist) => {
    setOperations(prev => prev.map(o => {
      if (o.id === opId) {
        return {
          ...o,
          checklist: {
            ...o.checklist,
            [docKey]: !o.checklist[docKey]
          }
        };
      }
      return o;
    }));
  };

  const deleteOperation = (opId: string) => {
    setOperations(prev => prev.filter(o => o.id !== opId));
  };

  const addOperationNote = (opId: string, text: string) => {
    if (!text.trim()) return;
    const newNote: OperationNote = {
      id: 'on-' + Date.now(),
      author: currentUser,
      text: text.trim(),
      date: new Date().toISOString()
    };
    setOperations(prev => prev.map(o => {
      if (o.id === opId) {
        return {
          ...o,
          historicoNotas: [newNote, ...(o.historicoNotas || [])]
        };
      }
      return o;
    }));
  };

  return (
    <CRMContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        setCurrentUser,
        login,
        logout,

        activeTab,
        setActiveTab,
        leadViewMode,
        setLeadViewMode,
        globalSearch,
        setGlobalSearch,

        leads,
        visits,
        proposals,
        notes,
        operations,

        selectedLeadForDrawer,
        setSelectedLeadForDrawer,
        isLeadFormOpen,
        setIsLeadFormOpen,
        editingLead,
        setEditingLead,

        isCallModalOpen,
        setIsCallModalOpen,
        callModalLeadId,
        setCallModalLeadId,
        openCallModal,

        isVisitFormOpen,
        setIsVisitFormOpen,
        preselectedVisitLeadId,
        setPreselectedVisitLeadId,
        editingVisit,
        setEditingVisit,

        isProposalFormOpen,
        setIsProposalFormOpen,
        preselectedProposalLeadId,
        setPreselectedProposalLeadId,
        editingProposal,
        setEditingProposal,

        isAIModalOpen,
        setIsAIModalOpen,
        aiTargetLead,
        setAITargetLead,
        openAIAnalysis,

        deleteImpactModal,
        setDeleteImpactModal,

        addLead,
        updateLead,
        requestDeleteLead,
        confirmDeleteLead,
        updateLeadPhase,
        discardLead,
        restoreLead,
        addNoteToLead,
        addCallNoteToLead,

        addNote,
        updateNote,
        deleteNote,
        togglePinNote,

        addVisit,
        updateVisit,
        deleteVisit,
        toggleVisitRealizada,

        addProposal,
        updateProposal,
        deleteProposal,
        acceptProposal,

        addOperation,
        updateOperation,
        updateOperationStage,
        toggleChecklistDoc,
        deleteOperation,
        addOperationNote
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
