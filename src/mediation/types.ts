export interface Buyer {
  id: string; name: string; phone: string; email?: string; source: string; zones: string[];
  propertyTypes: string[]; budget: number; bedrooms: number; timeframe: string;
  financeStatus: string; answers: Record<string, boolean | null>; screening: string;
  stage: string; assignedTo: string; notes: string; callValidatedAt?: string;
  callValidatedBy?: string; qualifiedAt?: string; nextContactAt?: string; propertyId?: string;
  cpcvAt?: string; soldAt?: string; depositConfirmed: boolean; marketingConsent: boolean;
  consentAt?: string; consentVersion?: string; attribution: Record<string, string>;
  createdAt: string; updatedAt: string;
}
export interface Property {
  id: string; title: string; zone: string; propertyType: string; bedrooms: number;
  price: number; business: string; stage: string; ownerName: string; ownerPhone: string;
  commission: number; description: string; assignedTo: string; legacyLeadId?: string;
}
export interface Partner {
  id: string; code: string; name: string; email?: string; phone: string; kind: string;
  specialty: string; reward: number; active: boolean; notes: string;
}
export interface Referral {
  id: string; buyerId: string; partnerId: string; reward: number; paidAt?: string; paidBy?: string;
}
export interface Launch {
  id: string; propertyId: string; scheduledAt: string; status: string; notes: string; contactedIds: string[];
}
export interface Conversion {
  id: string; buyerId?: string; ownerId?: string; campaignId: string; pixelId: string; eventName: string; eventTime: string; status: string;
  attempts: number; lastError?: string; sentAt?: string;
}
export interface MediationData {
  owners: any[]; campaigns: any[]; acquisitions: any[]; legacyBuyers: any[];
  buyers: Buyer[]; properties: Property[]; partners: Partner[]; referrals: Referral[];
  launches: Launch[]; events: Conversion[];
  legacyOwners: {id: string; nomeProprietario: string; telefone: string; tipoImovel: string; moradaZona?: string; freguesia: string; mediacaoPrecoVenda?: number; valorMinimoAbsoluto: number}[];
  meta: { configured: boolean; enabled: boolean; testMode: boolean; pixelId: string | null; missing: string[] };
}
