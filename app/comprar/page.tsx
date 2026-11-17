import PublicLanding from '@/mediation/PublicLanding';
import { prisma } from '@/lib/prisma';
import { resolveQuestions, publicQuestions } from '@/mediation/questions';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Encontre o seu próximo imóvel | AH Mediação' };
export default async function Page() { return <PublicLanding questionSet={publicQuestions(await resolveQuestions(prisma, 'Compradores'))} campaign={{ kind: 'Compradores', headline: 'O seu próximo lugar começa aqui.' }}/>; }
