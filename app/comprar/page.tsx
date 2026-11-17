import PublicLanding from '@/mediation/PublicLanding';
export const metadata = { title: 'Encontre o seu próximo imóvel | AH Mediação' };
export default function Page() { return <PublicLanding campaign={{ kind: 'Compradores', headline: 'O seu próximo lugar começa aqui.' }}/>; }
