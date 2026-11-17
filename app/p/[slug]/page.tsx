import PublicLanding from '@/mediation/PublicLanding';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { resolveQuestions, publicQuestions } from '@/mediation/questions';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Imóveis na região de Aveiro | AH Mediação' };
export default async function Page({ params }: { params: { slug: string } }) {
  const campaign = await prisma.adCampaign.findUnique({ where: { slug: params.slug } });
  if (!campaign?.published) notFound();
  const property = campaign.propertyId ? await prisma.brokerageProperty.findUnique({ where: { id: campaign.propertyId } }) : null;
  if (campaign.kind === 'Imóvel' && (!property || !['Contrato assinado', 'Em comercialização', 'Reservado'].includes(property.stage))) notFound();
  // Never serialize owner data, credentials, internal notes or integration settings into a public page.
  const questions = await resolveQuestions(prisma, campaign.kind === 'Angariação' ? 'Angariação' : 'Compradores', campaign.questionVersionId);
  return <PublicLanding questionSet={publicQuestions(questions)} campaign={{ kind: campaign.kind, slug: campaign.slug, headline: campaign.headline, description: campaign.description, imageUrl: campaign.imageUrl }}
    property={property ? { title: property.title, zone: property.zone, price: property.price, bedrooms: property.bedrooms, propertyType: property.propertyType } : undefined}/>;
}
