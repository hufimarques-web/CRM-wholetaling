import { notFound } from 'next/navigation';
import Preview from '@/mediation/Preview';
import PublicLanding from '@/mediation/PublicLanding';
export const dynamic = 'force-dynamic';
export default function Page({ searchParams }: { searchParams: { mobile?: string; form?: string } }){
  if(process.env.NODE_ENV !== 'development')notFound();
  if(searchParams.form) return <PublicLanding questionSet={{versionId:'preview-only',requireBudget:false,questions:[{key:'sell',label:'Pretende vender o seu imóvel nos próximos seis meses?'},{key:'exclusive',label:'Tem um contrato de exclusividade ativo?'}]}}/>;
  if(searchParams.mobile) return <div style={{display:'flex',gap:24,padding:24,background:'#dce4de',minHeight:'100vh'}}><iframe title="Angariação mobile · 390 px" src="/dev-preview?form=1" style={{width:390,height:844,border:0}}/><iframe title="CRM mobile · 390 px" src="/dev-preview" style={{width:390,height:844,border:0}}/></div>;
  return <Preview/>;
}
