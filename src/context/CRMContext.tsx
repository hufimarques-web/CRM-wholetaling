import React, { createContext, useContext, useState, useEffect } from 'react';
import { Lead, Visit, Proposal, LeadPhase, ContactStatus, Note, CallResult } from '../types/crm';
import { INITIAL_LEADS, INITIAL_VISITS, INITIAL_PROPOSALS } from '../data/initialData';
import { calcLeadPotentialMargin, calcProposalMargin, calcProposalSpread } from '../utils/formatters';

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
  author?: string;
}

interface CRMContextType {
  leads: Lead[];
  visits: Visit[];
  proposals: Proposal[];
  activeTab: 'dashboard' | 'leads' | 'calendar' | 'proposals';
  setActiveTab: (tab: 'dashboard' | 'leads' | 'calendar' | 'proposals') => void;
  leadViewMode: 'funnel' | 'table';
  setLeadViewMode: (mode: 'funnel' | 'table') => void;
  globalSearch: string;
  setGlobalSearch: (query: string) => void;
  
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

  isVisitFormOpen: boolean;
  setIsVisitFormOpen: (open: boolean) => void;
  preselectedVisitLeadId: string | null;
  setPreselectedVisitLeadId: (leadId: string | null) => void;
  editingVisit: Visit | null;
  setEditingVisit: (visit: Visit | null) => void;
  
  isProposalFormOpen: boolean;
  setIsProposalFormOpen: (open: boolean) => void;
  preselectedProposalLeadId: string | null;
  setPreselectedProposalLeadId: (leadId: string | null) => void;
  editingProposal: Proposal | null;
  setEditingProposal: (proposal: Proposal | null) => void;
  
  // Delete confirm state
  deleteImpactModal: LeadDeleteImpact | null;
  setDeleteImpactModal: (impact: LeadDeleteImpact | null) => void;

  // Actions
  addLead: (leadData: Omit<Lead, 'id' | 'dataEntrada' | 'margemPotencial' | 'notas'> & { notas?: Note[] }) => Lead;
  updateLead: (lead: Lead) => void;
  requestDeleteLead: (leadId: string) => void;
  confirmDeleteLead: (leadId: string) => void;
  updateLeadPhase: (leadId: string, newPhase: LeadPhase) => void;
  addNoteToLead: (leadId: string, text: string, author?: string) => void;
  addCallNoteToLead: (params: AddCallNoteParams) => void;

  addVisit: (visitData: Omit<Visit, 'id' | 'nomeProprietario' | 'moradaZona' | 'concelhoFreguesia'>) => Visit;
  updateVisit: (visit: Visit) => void;
  deleteVisit: (visitId: string) => void;

  addProposal: (proposalData: Omit<Proposal, 'id' | 'nomeProprietario' | 'moradaConcelhoFreguesia' | 'margemPrevista' | 'spread'>) => Proposal;
  updateProposal: (proposal: Proposal) => void;
  deleteProposal: (proposalId: string) => void;
  acceptProposal: (proposalId: string) => void;

  resetToDemoData: () => void;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & Search
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leads' | 'calendar' | 'proposals'>('leads');
  const [leadViewMode, setLeadViewMode] = useState<'funnel' | 'table'>('funnel');
  const [globalSearch, setGlobalSearch] = useState('');

  // Main Data States with LocalStorage Initialization
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('wt_crm_leads');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_LEADS;
  });

  const [visits, setVisits] = useState<Visit[]>(() => {
    const saved = localStorage.getItem('wt_crm_visits');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_VISITS;
  });

  const [proposals, setProposals] = useState<Proposal[]>(() => {
    const saved = localStorage.getItem('wt_crm_proposals');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_PROPOSALS;
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

  const [deleteImpactModal, setDeleteImpactModal] = useState<LeadDeleteImpact | null>(null);

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
    if (selectedLeadForDrawer) {
      const updated = leads.find(l => l.id === selectedLeadForDrawer.id);
      if (updated) setSelectedLeadForDrawer(updated);
    }
  }, [leads]);

  const openCallModal = (leadId: string) => {
    setCallModalLeadId(leadId);
    setIsCallModalOpen(true);
  };

  // LEAD ACTIONS
  const addLead = (leadData: Omit<Lead, 'id' | 'dataEntrada' | 'margemPotencial' | 'notas'> & { notas?: Note[] }): Lead => {
    const id = 'lead-' + Date.now();
    const dataEntrada = new Date().toISOString().split('T')[0];
    const margemPotencial = calcLeadPotentialMargin(leadData.valorEstimadoAvaliacao, leadData.valorMinimoAbsoluto);
    
    const newLead: Lead = {
      ...leadData,
      id,
      dataEntrada,
      margemPotencial,
      notas: leadData.notas || []
    };

    setLeads(prev => [newLead, ...prev]);
    return newLead;
  };

  const updateLead = (updatedLead: Lead) => {
    const margemPotencial = calcLeadPotentialMargin(updatedLead.valorEstimadoAvaliacao, updatedLead.valorMinimoAbsoluto);
    const finalLead = { ...updatedLead, margemPotencial };

    setLeads(prev => prev.map(l => l.id === finalLead.id ? finalLead : l));
  };

  const updateLeadPhase = (leadId: string, newPhase: LeadPhase) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, fase: newPhase } : l));
  };

  const addNoteToLead = (leadId: string, text: string, author: string = 'Equipa CRM') => {
    if (!text.trim()) return;
    const newNote: Note = {
      id: 'note-' + Date.now(),
      author,
      date: new Date().toISOString(),
      text: text.trim(),
      type: 'general'
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
  };

  const addCallNoteToLead = ({ leadId, text, callResult, date, nextContactDate, author = 'Gestor CRM' }: AddCallNoteParams) => {
    if (!text.trim()) return;
    
    const newNote: Note = {
      id: 'note-call-' + Date.now(),
      author,
      date: date || new Date().toISOString(),
      text: text.trim(),
      type: 'call',
      callResult,
      nextContactDate
    };

    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        // Coherent contact status updating
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
    setDeleteImpactModal(null);
    if (selectedLeadForDrawer?.id === leadId) {
      setSelectedLeadForDrawer(null);
    }
  };

  // VISIT ACTIONS
  const addVisit = (visitData: Omit<Visit, 'id' | 'nomeProprietario' | 'moradaZona' | 'concelhoFreguesia'>): Visit => {
    const lead = leads.find(l => l.id === visitData.leadId);
    const id = 'vis-' + Date.now();

    const newVisit: Visit = {
      ...visitData,
      id,
      nomeProprietario: lead ? lead.nomeProprietario : 'N/A',
      moradaZona: lead ? lead.moradaZona : 'N/A',
      concelhoFreguesia: lead ? `${lead.concelho}, ${lead.freguesia}` : 'N/A',
    };

    setVisits(prev => [newVisit, ...prev]);

    if (lead) {
      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, contacto: 'Reunião marcada' as ContactStatus } : l));
    }

    return newVisit;
  };

  const updateVisit = (updatedVisit: Visit) => {
    const lead = leads.find(l => l.id === updatedVisit.leadId);
    const finalVisit = {
      ...updatedVisit,
      nomeProprietario: lead ? lead.nomeProprietario : updatedVisit.nomeProprietario,
      moradaZona: lead ? lead.moradaZona : updatedVisit.moradaZona,
      concelhoFreguesia: lead ? `${lead.concelho}, ${lead.freguesia}` : updatedVisit.concelhoFreguesia
    };

    setVisits(prev => prev.map(v => v.id === finalVisit.id ? finalVisit : v));
  };

  const deleteVisit = (visitId: string) => {
    setVisits(prev => prev.filter(v => v.id !== visitId));
  };

  // PROPOSAL ACTIONS
  const addProposal = (proposalData: Omit<Proposal, 'id' | 'nomeProprietario' | 'moradaConcelhoFreguesia' | 'margemPrevista' | 'spread'>): Proposal => {
    const lead = leads.find(l => l.id === proposalData.leadId);
    const id = 'prop-' + Date.now();

    const margemPrevista = calcProposalMargin(proposalData.valorRevenda, proposalData.valorProposta);
    const spread = calcProposalSpread(proposalData.valorRevenda, proposalData.valorProposta);

    const newProposal: Proposal = {
      ...proposalData,
      id,
      nomeProprietario: lead ? lead.nomeProprietario : 'N/A',
      moradaConcelhoFreguesia: lead ? `${lead.moradaZona}, ${lead.concelho} (${lead.freguesia})` : 'N/A',
      margemPrevista,
      spread
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

    const finalProposal: Proposal = {
      ...updatedProposal,
      nomeProprietario: lead ? lead.nomeProprietario : updatedProposal.nomeProprietario,
      moradaConcelhoFreguesia: lead ? `${lead.moradaZona}, ${lead.concelho} (${lead.freguesia})` : updatedProposal.moradaConcelhoFreguesia,
      margemPrevista,
      spread
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
      addNoteToLead(prop.leadId, `Proposta de ${prop.valorProposta} € aceite! Fase atualizada para CPCV a preparar.`, 'Sistema Propostas');
    }
  };

  const resetToDemoData = () => {
    setLeads(INITIAL_LEADS);
    setVisits(INITIAL_VISITS);
    setProposals(INITIAL_PROPOSALS);
    localStorage.removeItem('wt_crm_leads');
    localStorage.removeItem('wt_crm_visits');
    localStorage.removeItem('wt_crm_proposals');
    localStorage.removeItem('wt_crm_call_drafts');
  };

  return (
    <CRMContext.Provider
      value={{
        leads,
        visits,
        proposals,
        activeTab,
        setActiveTab,
        leadViewMode,
        setLeadViewMode,
        globalSearch,
        setGlobalSearch,

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

        deleteImpactModal,
        setDeleteImpactModal,

        addLead,
        updateLead,
        requestDeleteLead,
        confirmDeleteLead,
        updateLeadPhase,
        addNoteToLead,
        addCallNoteToLead,

        addVisit,
        updateVisit,
        deleteVisit,

        addProposal,
        updateProposal,
        deleteProposal,
        acceptProposal,

        resetToDemoData
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
