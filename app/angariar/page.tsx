import PublicLanding from '@/mediation/PublicLanding';
import { prisma } from '@/lib/prisma';
import { resolveQuestions, publicQuestions } from '@/mediation/questions';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Vender o seu imóvel | AH Mediação' };
export default async function Page() { return <PublicLanding questionSet={publicQuestions(await resolveQuestions(prisma, 'Angariação'))}/>; }
