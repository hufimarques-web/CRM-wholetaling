import test from 'node:test';
import assert from 'node:assert/strict';
import { screenBuyer, canSendMeta, screenOwner, ownerCanSend, matchBuyer, rewardEligible, CONSENT_VERSION, routeMatches, defaultQuestionSnapshot, DEFAULT_QUESTION_IDS } from './domain.mjs';
import { questionSetInput, saveQuestionSet, resolveQuestions, validateQuestionAnswers, publicQuestions } from './questions.ts';
import { saveBuyer } from './service.ts';
import { saveOwner } from './owners.ts';
import { campaignInput, campaignStatus, queueBuyerEvents } from './campaigns.ts';
import { metaPayload, dispatchMeta } from './meta.ts';

const now = new Date();
const buyer = () => ({ name:'Pessoa de teste', phone:'912345678', email:'test@example.invalid', zones:['Aveiro'], propertyTypes:['Apartamento'], budget:230000, bedrooms:2, financeStatus:'Pré-aprovado', answers:{ intent:true, area:true, budget:true, finance:true }, marketingConsent:true });
const owner = () => ({ name:'Proprietário de teste', phone:'913456789', zone:'Aveiro', propertyType:'Moradia', answers:{contact:true,authority:true,area:true,mediation:true}, marketingConsent:true });
const campaign = (id, kind='Imóvel') => ({ id, kind, published:true, enabled:true, propertyId:`property-${id}`, pixelId:id==='a'?'11111111':'22222222', tokenEnv:`META_TOKEN_${id.toUpperCase()}`, testCode:'' });
function memory() {
  const tables={buyerProfile:[],ownerLead:[],buyerAcquisition:[],metaConversion:[],adCampaign:[campaign('a'),campaign('b'),campaign('o','Angariação')],brokerageProperty:[{id:'property-a'},{id:'property-b'}],referralPartner:[],referral:[],mediationAudit:[],questionSet:[],questionVersion:[],questionResponse:[]};
  for(const kind of ['Compradores','Angariação']) { const id=DEFAULT_QUESTION_IDS[kind],setId=id.replace('-v1','');tables.questionSet.push({id:setId,kind,name:defaultQuestionSnapshot(kind).name,active:true});tables.questionVersion.push({id,setId,version:1,snapshot:defaultQuestionSnapshot(kind)}); }
  const eq=(row,where={})=>Object.entries(where).every(([k,v])=> k==='OR'?v.some(w=>eq(row,w)): k==='buyerId_campaignId'?eq(row,v): v && typeof v==='object' && !(v instanceof Date)? ('in'in v?v.in.includes(row[k]):'lte'in v?row[k]<=v.lte:'lt'in v?row[k]<v.lt:false) : row[k] instanceof Date && v instanceof Date ? +row[k]===+v : row[k]===v);
  const db={tables,$transaction:async fn=>fn(db)};
  const included=(r,opts={})=>!r?null:structuredClone({...r,...(opts.include?.set?{set:tables.questionSet.find(s=>s.id===r.setId)}:{}),...(opts.include?.versions?{versions:tables.questionVersion.filter(v=>v.setId===r.id).sort((a,b)=>b.version-a.version).slice(0,opts.include.versions.take||Infinity)}:{})});
  for(const name of Object.keys(tables)) db[name]={
    findUnique:async(opts)=>included(tables[name].find(r=>eq(r,opts.where)),opts),
    findFirst:async(opts)=>{let rows=tables[name].filter(r=>eq(r,opts.where));if(opts.orderBy?.version)rows.sort((a,b)=>b.version-a.version);if(opts.orderBy?.createdAt)rows.reverse();return included(rows[0],opts);},
    findMany:async(opts={})=>tables[name].filter(r=>eq(r,opts.where)).slice(0,opts.take||Infinity).map(r=>({...r,...(opts.include?.campaign?{campaign:tables.adCampaign.find(c=>c.id===r.campaignId)}:{})})),
    create:async({data})=>{const r={id:`${name}-${tables[name].length}`,createdAt:new Date(),updatedAt:new Date(),status:'pending',attempts:0,nextAttempt:new Date(),lockedUntil:null,...data};tables[name].push(r);return r;},
    update:async({where,data})=>{const r=tables[name].find(r=>eq(r,where));Object.assign(r,data,{updatedAt:new Date()});return structuredClone(r);},
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

test('biblioteca cria versões imutáveis; contactos anteriores conservam regras e respostas',async()=>{
 const db=memory();await saveBuyer(db,{...buyer(),campaignId:'a'},'public',{public:true});
 const original=structuredClone(db.tables.buyerProfile[0]),originalVersion=structuredClone(db.tables.questionVersion[0]);
 const snapshot=defaultQuestionSnapshot('Compradores');snapshot.questions[1].passValue=false;snapshot.questions[1].label='Procura fora da região de Aveiro?';
 const v2=await saveQuestionSet(db,{...snapshot,id:'questions-buyers',baseVersionId:'questions-buyers-v1'},'Hugo');
 assert.equal(v2.version,2);assert.deepEqual(db.tables.questionVersion[0],originalVersion);assert.deepEqual(db.tables.buyerProfile[0],original);
 assert.equal(screenBuyer(original),'Elegível');assert.equal(screenBuyer({...original,questionSnapshot:v2.snapshot}),'Não elegível');
 assert.equal((await resolveQuestions(db,'Compradores')).questionVersionId,v2.id);
 assert.equal((await resolveQuestions(db,'Compradores',undefined,original)).questionVersionId,'questions-buyers-v1');
 await assert.rejects(saveQuestionSet(db,{...snapshot,id:'questions-buyers',baseVersionId:'questions-buyers-v1'},'Hugo'),/mudou/);
});
test('trocar conjunto retira validação, cancela pendentes e guarda histórico sem reinterpretar respostas',async()=>{
 const db=memory();await saveBuyer(db,{...buyer(),campaignId:'a'},'public',{public:true});let b=db.tables.buyerProfile[0];
 await saveBuyer(db,{...b,updatedAt:b.updatedAt.toISOString(),validateCall:true},'Hugo');
 const second=await saveQuestionSet(db,{name:'Procura de terrenos',kind:'Compradores',requireBudget:false,requireFinance:false,questions:[{key:'land',label:'Quer comprar um terreno?',eliminatory:true,passValue:true}]},'Hugo');
 b=db.tables.buyerProfile[0];await saveBuyer(db,{id:b.id,updatedAt:b.updatedAt.toISOString(),questionVersionId:second.id},'Hugo');
 b=db.tables.buyerProfile[0];assert.equal(b.callValidatedAt,null);assert.equal(b.stage,'Novo');assert.deepEqual(b.answers,{land:null});assert.equal(db.tables.metaConversion[0].status,'cancelled');
 const history=db.tables.questionResponse;assert.equal(history.length,2);assert.equal(history[0].questionVersionId,'questions-buyers-v1');assert.equal(history[0].answers.intent,true);assert.equal(history[1].questionVersionId,second.id);
 await saveBuyer(db,{id:b.id,updatedAt:b.updatedAt.toISOString(),answers:{land:true},validateCall:true,budget:0,financeStatus:'Por confirmar'},'Hugo');
 assert.equal(db.tables.buyerProfile[0].stage,'Qualificado');assert.equal(db.tables.metaConversion.length,1,'outro conjunto não gera um sinal para a campanha antiga');
});
test('pergunta com Não aceite e pergunta informativa funcionam; critérios adicionais são configuráveis',()=>{
 const snapshot={name:'Proprietários',kind:'Angariação',version:1,questions:[{key:'exclusive',label:'Tem contrato exclusivo ativo?',eliminatory:true,passValue:false},{key:'photos',label:'Tem fotografias?',eliminatory:false,passValue:true}]};
 assert.equal(screenOwner({...owner(),questionSnapshot:snapshot,answers:{exclusive:false,photos:false}}),'Elegível');
 assert.equal(screenOwner({...owner(),questionSnapshot:snapshot,answers:{exclusive:true,photos:false}}),'Não elegível');
 assert.equal(screenOwner({...owner(),questionSnapshot:snapshot,answers:{exclusive:false}}),'Pendente');
 assert.throws(()=>validateQuestionAnswers({exclusive:false,unexpected:true},snapshot,true),/não correspondem/);
 assert.throws(()=>validateQuestionAnswers({exclusive:false},snapshot,true),/todas/);
 assert.throws(()=>questionSetInput({...snapshot,questions:[]}),/1 e 20/);
 assert.throws(()=>questionSetInput({...snapshot,questions:[snapshot.questions[0],snapshot.questions[0]]}),/diferente/);
});
test('versão de angariação não pode ser aplicada a comprador e regras não são expostas no formulário público',async()=>{
 const db=memory();await assert.rejects(resolveQuestions(db,'Compradores','questions-owners-v1'),/adequado/);
 const resolved=await resolveQuestions(db,'Angariação');const publicForm=publicQuestions(resolved);
 assert.ok(publicForm.versionId);assert.equal(publicForm.questions[0].label,resolved.questionSnapshot.questions[0].label);
 assert.equal(publicForm.questions[0].passValue,undefined);assert.equal(publicForm.questions[0].eliminatory,undefined);
});
test('cada origem guarda o seu conjunto mesmo quando o comprador responde a páginas diferentes',async()=>{
 const db=memory();await saveBuyer(db,{...buyer(),campaignId:'a'},'public',{public:true});
 const v=await saveQuestionSet(db,{name:'Compradores de terreno',kind:'Compradores',requireBudget:false,requireFinance:false,questions:[{key:'land',label:'Procura terreno?',eliminatory:true,passValue:true}]},'Hugo');
 await saveBuyer(db,{...buyer(),campaignId:'b',questionVersionId:v.id,answers:{land:true}},'public',{public:true});
 assert.equal(db.tables.buyerProfile.length,1);assert.equal(db.tables.buyerProfile[0].questionVersionId,'questions-buyers-v1');
 assert.equal(db.tables.buyerAcquisition[0].questionVersionId,'questions-buyers-v1');assert.equal(db.tables.buyerAcquisition[1].questionVersionId,v.id);assert.deepEqual(db.tables.buyerAcquisition[1].submission.answers,{land:true});
});
