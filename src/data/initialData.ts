import { Lead, Visit, Proposal, Note, DealOperation } from '../types/crm';

// The database (Neon PostgreSQL) is the 100% single source of truth.
// Initial state starts empty and populates dynamically from the database via /api/bootstrap.
export const INITIAL_LEADS: Lead[] = [];
export const INITIAL_VISITS: Visit[] = [];
export const INITIAL_PROPOSALS: Proposal[] = [];
export const INITIAL_NOTES: Note[] = [];
export const INITIAL_OPERATIONS: DealOperation[] = [];
