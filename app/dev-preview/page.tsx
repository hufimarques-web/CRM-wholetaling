import { notFound } from 'next/navigation';
import Preview from '@/mediation/Preview';
export const dynamic = 'force-dynamic';
export default function Page({ searchParams }: { searchParams: { mobile?: string } }){
  if(process.env.NODE_ENV !== 'development')notFound();
  if(searchParams.mobile) return <div style={{display:'flex',gap:24,padding:24,background:'#dce4de',minHeight:'100vh'}}><iframe title="Angariação mobile · 390 px" src="/angariar" style={{width:390,height:844,border:0}}/><iframe title="CRM mobile · 390 px" src="/dev-preview" style={{width:390,height:844,border:0}}/></div>;
  return <Preview/>;
}
