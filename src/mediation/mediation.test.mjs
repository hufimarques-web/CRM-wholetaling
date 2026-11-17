import test from 'node:test';
import assert from 'node:assert/strict';
import { screenBuyer, canSendMeta, screenOwner, ownerCanSend, matchBuyer, rewardEligible, CONSENT_VERSION, routeMatches } from './domain.mjs';
import { saveBuyer } from './service.ts';
import { saveOwner } from './owners.ts';
import { campaignInput, campaignStatus, queueBuyerEvents } from './campaigns.ts';
import { metaPayload, dispatchMeta } from './meta.ts';

const now = new Date();
const buyer = () => ({ name:'Pessoa de teste', phone:'912345678', email:'test@example.invalid', zones:['Aveiro'], propertyTypes:['Apartamento'], budget:230000, bedrooms:2, financeStatus:'Pré-aprovado', answers:{ intent:true, area:true, budget:true, finance:true }, marketingConsent:true });
const owner = () => ({ name:'Proprietário de teste', phone:'913456789', zone:'Aveiro', propertyType:'Moradia', answers:{contact:true,authority:true,area:true,mediation:true}, marketingConsent:true });
const campaign = (id, kind='Imóvel') => ({ id, kind, published:true, enabled:true, propertyId:`property-${id}`, pixelId:id==='a'?'11111111':'22222222', tokenEnv:`META_TOKEN_${id.toUpperCase()}`, testCode:'' });
function memory() {
  const tables={buyerProfile:[],ownerLead:[],buyerAcquisition:[],metaConversion:[],adCampaign:[campaign('a'),campaign('b'),campaign('o','Angariação')],brokerageProperty:[{id:'property-a'},{id:'property-b'}],referralPartner:[],referral:[],mediationAudit:[]};
  const eq=(row,where={})=>Object.entries(where).every(([k,v])=> k==='OR'?v.some(w=>eq(row,w)): k==='buyerId_campaignId'?eq(row,v): v && typeof v==='object' && !(v instanceof Date)? ('in'in v?v.in.includes(row[k]):'lte'in v?row[k]<=v.lte:'lt'in v?row[k]<v.lt:false) : row[k] instanceof Date && v instanceof Date ? +row[k]===+v : row[k]===v);
  const db={tables,$transaction:async fn=>fn(db)};
  for(const name of Object.keys(tables)) db[name]={
    findUnique:async({where})=>tables[name].find(r=>eq(r,where))||null,
    findFirst:async({where})=>tables[name].find(r=>eq(r,where))||null,
    findMany:async(opts={})=>tables[name].filter(r=>eq(r,opts.where)).slice(0,opts.take||Infinity).map(r=>({...r,...(opts.include?.campaign?{campaign:tables.adCampaign.find(c=>c.id===r.campaignId)}:{})})),
    create:async({data})=>{const r={id:`${name}-${tables[name].length}`,createdAt:new Date(),updatedAt:new Date(),status:'pending',attempts:0,nextAttempt:new Date(),lockedUntil:null,...data};tables[name].push(r);return r;},
    update:async({where,data})=>{const r=tables[name].find(r=>eq(r,where));Object.assign(r,data,{updatedAt:new Date()});return r;},
    updateMany:async({where,data})=>{const rows=tables[name].filter(r=>eq(r,where));for(const r of rows) for(const [k,v]of Object.entries(data))r[k]=v?.increment?r[k]+v.increment:v;return{count:rows.length};},
    upsert:async({where,create,update})=>{const r=tables[name].find(r=>eq(r,where));return r?db[name].update({where,data:update}):db[name].create({data:create});}
  };
  return db;
}
test('triagem exige respostas, orçamento e financiamento; sem chamada ou consentimento não há sinal',()=>{
  const b=buyer();assert.equal(screenBuyer(b),'Elegível');assert.equal(canSendMeta(b),false);
  assert.equal(screenBuyer({...b,answers:{...b.answers,finance:false}}),'Não elegível');
  assert.equal(screenBuyer({...b,financeStatus:'Em análise'}),'Pendente');
  assert.equal(screenBuyer({...b,budget:0}),'Pendente');
  const q={...b,stage:'Qualificado',callValidatedAt:now,qualifiedAt:now,consentAt:now,consentVersion:CONSENT_VERSION};
  assert.equal(canSendMeta(q),true);assert.equal(canSendMeta({...q,marketingConsent:false}),false);assert.equal(canSendMeta({...q,stage:'Base de informação'}),false);
});
test('compradores são cruzados por zona, tipo, preço e financiamento validado',()=>{
 const b={...buyer(),callValidatedAt:now,qualifiedAt:now,stage:'Qualificado'},p={zone:'aveiro',propertyType:'Apartamento',price:220000,bedrooms:2,stage:'Em comercialização'};
 assert.equal(matchBuyer(b,p),true);assert.equal(matchBuyer(b,{...p,price:250000}),false);assert.equal(matchBuyer(b,{...p,zone:'Porto'}),false);
 assert.equal(rewardEligible({...b,stage:'CPCV',cpcvAt:now,depositConfirmed:false}),false);assert.equal(rewardEligible({...b,stage:'CPCV',cpcvAt:now,depositConfirmed:true}),true);
});
test('formulário público não aceita qualificação, etapa ou ID do cliente e deduplica por telefone',async()=>{
 const db=memory();const raw={...buyer(),campaignId:'a',validateCall:true,stage:'Qualificado',id:'injected'};
 await saveBuyer(db,raw,'public',{public:true});assert.equal(db.tables.buyerProfile[0].stage,'A contactar');assert.equal(db.tables.metaConversion.length,0);
 await saveBuyer(db,{...raw,name:'Ataque overwrite'},'public',{public:true});assert.equal(db.tables.buyerProfile.length,1);assert.equal(db.tables.buyerProfile[0].name,'Pessoa de teste');assert.equal(db.tables.buyerAcquisition.length,1);
 await saveBuyer(db,{...raw,campaignId:'b'},'public',{public:true});assert.equal(db.tables.buyerAcquisition.length,2);assert.equal(db.tables.metaConversion.length,0);
});
test('resposta negativa fica na base; não pode ser promovida apenas escolhendo etapa',async()=>{
 const db=memory();await saveBuyer(db,{...buyer(),answers:{...buyer().answers,area:false},campaignId:'a'},'public',{public:true});
 const b=db.tables.buyerProfile[0];assert.equal(b.stage,'Base de informação');
 await assert.rejects(saveBuyer(db,{...b,updatedAt:b.updatedAt.toISOString(),validateCall:true},'Hugo'),/Confirme/);assert.equal(db.tables.metaConversion.length,0);
});
test('chamada validada cria sinal idempotente na origem e etapas seguintes apenas no imóvel associado',async()=>{
 const db=memory();await saveBuyer(db,{...buyer(),campaignId:'a'},'public',{public:true});await saveBuyer(db,{...buyer(),campaignId:'b'},'public',{public:true});
 let b=db.tables.buyerProfile[0];await saveBuyer(db,{...b,updatedAt:b.updatedAt.toISOString(),validateCall:true},'Hugo');assert.equal(db.tables.metaConversion.length,2);
 b=db.tables.buyerProfile[0];await saveBuyer(db,{...b,updatedAt:b.updatedAt.toISOString(),stage:'Visita',propertyId:'property-a'},'Hugo');
 assert.equal(db.tables.metaConversion.filter(e=>e.eventName==='Schedule').length,1);assert.equal(db.tables.metaConversion.find(e=>e.eventName==='Schedule').pixelId,'11111111');
 b=db.tables.buyerProfile[0];await saveBuyer(db,{...b,updatedAt:b.updatedAt.toISOString()},'Hugo');assert.equal(db.tables.metaConversion.length,3);
 b=db.tables.buyerProfile[0];await saveBuyer(db,{...b,updatedAt:b.updatedAt.toISOString(),marketingConsent:false},'Hugo');assert.ok(db.tables.metaConversion.every(e=>e.status==='cancelled'));
});
test('angariação tem perguntas e evento diferentes dos compradores',async()=>{
 const db=memory();await saveOwner(db,{...owner(),campaignId:'o',validateCall:true},'public',true);let o=db.tables.ownerLead[0];assert.equal(o.stage,'A contactar');assert.equal(db.tables.metaConversion.length,0);
 assert.equal(screenOwner({...owner(),answers:{...owner().answers,authority:false}}),'Não elegível');
 await saveOwner(db,{...o,updatedAt:o.updatedAt.toISOString(),validateCall:true},'Hugo');o=db.tables.ownerLead[0];assert.equal(ownerCanSend(o),true);assert.equal(db.tables.metaConversion[0].eventName,'QualifiedOwner');assert.equal(db.tables.metaConversion[0].campaignId,'o');
});
test('configuração não aceita tokens no lugar do nome da variável; rota nunca usa Pixel errado',()=>{
 assert.throws(()=>campaignInput({name:'Teste',slug:'teste',kind:'Angariação',headline:'Teste',tokenEnv:'EAAbigsecrettoken'}),/variável/);
 assert.equal(campaignStatus(campaign('a'),{}).configured,false);
 assert.equal(routeMatches({campaignId:'a',pixelId:'22222222'},campaign('a')),false);
});
test('payload não expõe orçamento, notas ou dados pessoais em claro',()=>{
 const b={...buyer(),id:'b',phone:'+351912345678',stage:'Qualificado',callValidatedAt:now,qualifiedAt:now,consentAt:now,consentVersion:CONSENT_VERSION,notes:'private note'};
 const payload=metaPayload({id:'event',eventName:'QualifiedLead',eventTime:now},b,{attribution:{fbc:'fb.1.123.click'}},campaign('a'));
 const text=JSON.stringify(payload);for(const value of ['912345678','test@example','230000','private note','Pré-aprovado'])assert.ok(!text.includes(value));assert.equal(payload.data[0].user_data.ph[0].length,64);assert.equal(payload.data[0].user_data.fbc,'fb.1.123.click');
});
test('envio usa token e Pixel da origem; sucesso e teste são estados distintos',async()=>{
 const db=memory();await saveBuyer(db,{...buyer(),campaignId:'a'},'public',{public:true});const b=db.tables.buyerProfile[0];await saveBuyer(db,{...b,updatedAt:b.updatedAt.toISOString(),validateCall:true},'Hugo');
 db.tables.adCampaign[0].testCode='TEST123';let calls=0;
 const fake=async(url,options)=>{calls++;assert.ok(url.endsWith('/11111111/events'));assert.equal(options.headers.Authorization,'Bearer secret-a');assert.equal(JSON.parse(options.body).test_event_code,'TEST123');return{ok:true,status:200,json:async()=>({events_received:1})};};
 await dispatchMeta(db,5,fake,{META_TOKEN_A:'secret-a',META_TOKEN_B:'secret-b'});assert.equal(calls,1);assert.equal(db.tables.metaConversion[0].status,'test_sent');
 await dispatchMeta(db,5,fake,{META_TOKEN_A:'secret-a'});assert.equal(calls,1);
});
test('falha conserva ID; evento antigo expira sem inventar uma data recente',async()=>{
 const db=memory();await saveBuyer(db,{...buyer(),campaignId:'a'},'public',{public:true});const b=db.tables.buyerProfile[0];await saveBuyer(db,{...b,updatedAt:b.updatedAt.toISOString(),validateCall:true},'Hugo');
 const ev=db.tables.metaConversion[0],id=ev.id;
 await dispatchMeta(db,5,async()=>{throw Error('private token must not be persisted')},{META_TOKEN_A:'a'});assert.equal(ev.status,'failed');assert.equal(ev.id,id);assert.ok(!ev.lastError.includes('private token'));
 ev.nextAttempt=new Date(0);ev.eventTime=new Date(Date.now()-8*86400000);
 await dispatchMeta(db,5,async()=>{assert.fail('expired event must not be sent')},{META_TOKEN_A:'a'});assert.equal(ev.status,'expired');
});
test('sem configuração, sem consentimento ou com troca de Pixel não faz pedidos',async()=>{
 const db=memory();await saveBuyer(db,{...buyer(),campaignId:'a'},'public',{public:true});const b=db.tables.buyerProfile[0];await saveBuyer(db,{...b,updatedAt:b.updatedAt.toISOString(),validateCall:true},'Hugo');
 const no=async()=>assert.fail('network must not be called');await dispatchMeta(db,5,no,{});
 db.tables.adCampaign[0].pixelId='33333333';await dispatchMeta(db,5,no,{META_TOKEN_A:'a'});assert.equal(db.tables.metaConversion[0].attempts,0);
 db.tables.adCampaign[0].pixelId='11111111';b.marketingConsent=false;await dispatchMeta(db,5,no,{META_TOKEN_A:'a'});assert.equal(db.tables.metaConversion[0].status,'cancelled');
});
