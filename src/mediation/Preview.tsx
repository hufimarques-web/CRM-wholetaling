'use client';
import Workspace from './Workspace';
import type { MediationData } from './types';
const stamp = '2026-11-17T12:00:00.000Z';
const fixture: MediationData = {
  buyers: [
    { id:'demo-b1',name:'Comprador exemplo A',phone:'+351900000001',source:'Meta Ads',zones:['Aveiro'],propertyTypes:['Apartamento'],budget:240000,bedrooms:2,timeframe:'Até 3 meses',financeStatus:'Pré-aprovado',answers:{intent:true,area:true,budget:true,finance:true},screening:'Elegível',stage:'Qualificado',assignedTo:'Hugo',notes:'Dados fictícios de pré-visualização.',callValidatedAt:stamp,qualifiedAt:stamp,depositConfirmed:false,marketingConsent:false,attribution:{},createdAt:stamp,updatedAt:stamp},
    { id:'demo-b2',name:'Comprador exemplo B',phone:'+351900000002',source:'Parceiro profissional',zones:['Ílhavo'],propertyTypes:['Moradia'],budget:300000,bedrooms:3,timeframe:'3 a 6 meses',financeStatus:'Em análise',answers:{intent:true,area:true,budget:true,finance:null},screening:'Pendente',stage:'Novo',assignedTo:'Queirós',notes:'Dados fictícios.',depositConfirmed:false,marketingConsent:false,attribution:{},createdAt:stamp,updatedAt:stamp}
  ],
  properties:[{id:'demo-p1',title:'Apartamento T2 · Aveiro',zone:'Aveiro',propertyType:'Apartamento',bedrooms:2,price:225000,business:'Mediação',stage:'Em comercialização',ownerName:'Proprietário exemplo',ownerPhone:'+351900000003',commission:5,description:'Exemplo fictício.',assignedTo:'Hugo'}],
  owners:[{id:'demo-o1',name:'Proprietário exemplo',phone:'+351900000003',zone:'Ílhavo',propertyType:'Moradia',askingPrice:280000,answers:{contact:true,authority:true,area:true,mediation:true},screening:'Elegível',stage:'A contactar',campaignId:'demo-c2',updatedAt:stamp}],
  campaigns:[{id:'demo-c1',name:'Apartamento T2 · Aveiro',kind:'Imóvel',propertyId:'demo-p1',slug:'exemplo-t2-aveiro',headline:'Um novo lugar em Aveiro.',published:false,pixelId:'',enabled:false,integration:{configured:false}}, {id:'demo-c2',name:'Angariação · Região de Aveiro',kind:'Angariação',slug:'angariacao-aveiro',headline:'A sua casa pode ser a próxima escolha de alguém.',published:false,pixelId:'',enabled:false,integration:{configured:false}}],
  acquisitions:[{id:'demo-a1',buyerId:'demo-b1',campaignId:'demo-c1',screening:'Elegível',createdAt:stamp}],
  launches:[{id:'demo-l1',propertyId:'demo-p1',scheduledAt:'2026-11-24T10:00:00.000Z',status:'Planeado',notes:'Exemplo',contactedIds:[]}],
  partners:[{id:'demo-partner',code:'demo',name:'Parceiro exemplo',phone:'',kind:'Profissional',specialty:'Intermediação de crédito',reward:2000,active:true,notes:''}],
  referrals:[],events:[],legacyOwners:[],legacyBuyers:[],meta:{configured:false,enabled:false,testMode:false,pixelId:null,missing:['Pixel e token']}
};
async function transport(action?: string) { if (!action) return fixture; if(action==='audit')return {history:[]}; throw new Error('Pré-visualização: não são guardados dados nem enviados eventos.'); }
export default function Preview(){return <Workspace previewData={fixture} previewTransport={transport}/>;}
