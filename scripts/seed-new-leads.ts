import { PrismaClient } from '@prisma/client';
import { INITIAL_LEADS } from '../src/data/initialData';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding the 5 new qualified leads into Prisma SQLite database...');
  
  for (const lead of INITIAL_LEADS) {
    const createdLead = await prisma.lead.upsert({
      where: { id: lead.id },
      update: {
        nomeProprietario: lead.nomeProprietario,
        telefone: lead.telefone,
        freguesia: lead.freguesia,
        concelho: lead.concelho,
        moradaZona: lead.moradaZona,
        tipoImovel: lead.tipoImovel,
        estadoImovel: lead.estadoImovel,
        areaM2: lead.areaM2 ?? null,
        origem: lead.origem,
        valorMinimoAbsoluto: lead.valorMinimoAbsoluto,
        flexibilidade: lead.flexibilidade,
        prazoPretendido: lead.prazoPretendido,
        margemPotencial: lead.margemPotencial,
        ratingMercado: lead.ratingMercado,
        etiquetaMercado: lead.etiquetaMercado,
        contacto: lead.contacto,
        fotos: lead.fotos,
        fase: lead.fase,
        prioridade: lead.prioridade,
        assignedTo: lead.assignedTo,
        dataEntrada: lead.dataEntrada
      },
      create: {
        id: lead.id,
        nomeProprietario: lead.nomeProprietario,
        telefone: lead.telefone,
        freguesia: lead.freguesia,
        concelho: lead.concelho,
        moradaZona: lead.moradaZona,
        tipoImovel: lead.tipoImovel,
        estadoImovel: lead.estadoImovel,
        areaM2: lead.areaM2 ?? null,
        origem: lead.origem,
        valorMinimoAbsoluto: lead.valorMinimoAbsoluto,
        flexibilidade: lead.flexibilidade,
        prazoPretendido: lead.prazoPretendido,
        margemPotencial: lead.margemPotencial,
        ratingMercado: lead.ratingMercado,
        etiquetaMercado: lead.etiquetaMercado,
        contacto: lead.contacto,
        fotos: lead.fotos,
        fase: lead.fase,
        prioridade: lead.prioridade,
        assignedTo: lead.assignedTo,
        dataEntrada: lead.dataEntrada
      }
    });

    console.log(`Created/Updated lead: ${createdLead.nomeProprietario} (${createdLead.id})`);

    if (lead.notas && lead.notas.length > 0) {
      for (const nota of lead.notas) {
        await prisma.note.upsert({
          where: { id: nota.id },
          update: {
            text: nota.text,
            author: nota.author,
            assignedUser: nota.assignedUser,
            leadTitle: nota.leadTitle,
            pinned: nota.pinned ?? false
          },
          create: {
            id: nota.id,
            leadId: createdLead.id,
            leadTitle: nota.leadTitle,
            author: nota.author,
            assignedUser: nota.assignedUser,
            date: nota.date,
            text: nota.text,
            pinned: nota.pinned ?? false
          }
        });
        console.log(`  - Attached note: ${nota.id}`);
      }
    }
  }

  // Seed proposal
  await prisma.proposal.upsert({
    where: { id: 'prop-1790125953822' },
    update: {},
    create: {
      id: 'prop-1790125953822',
      leadId: 'lead-conceicao-bilho',
      nomeProprietario: 'Conceição Bilhó',
      moradaConcelhoFreguesia: 'Esgueira',
      valorMinimoAbsoluto: 70000,
      valorProposta: 35000,
      valorSinal: 3500,
      valorRevenda: 88000,
      margemPrevista: 53000,
      spread: 60.2,
      multiploSinal: 15.1,
      dataEnvio: '2026-09-23',
      estado: 'Aceite',
      assignedUser: 'Queirós'
    }
  });
  console.log('Seeded proposal for Conceição Bilhó');

  // Seed deal operation
  await prisma.dealOperation.upsert({
    where: { id: 'op-1790125967662' },
    update: {},
    create: {
      id: 'op-1790125967662',
      leadId: 'lead-conceicao-bilho',
      proposalId: 'prop-1790125953822',
      nomeProprietario: 'Conceição Bilhó',
      freguesia: 'Esgueira',
      tipoImovel: 'Ruína',
      valorCompraAcordado: 35000,
      valorSinalPago: 3500,
      valorRevendaAlvo: 88000,
      margemPrevista: 53000,
      multiploSinal: 15.1,
      fase: 'Validacao_Facebook',
      responsavel: 'Queirós',
      dataAceitacao: '2026-09-23',
      checklistJson: JSON.stringify({
        anuncioCriadoFacebook: true,
        leadsInteresseRecebidas: false,
        compradorIdentificado: false,
        sinalPago10: false
      }),
      notas: 'Proposta aceite em 2026-09-23. Teste de interesse no Facebook em curso.'
    }
  });
  console.log('Seeded deal operation for Conceição Bilhó');

  const totalLeads = await prisma.lead.count();
  const totalNotes = await prisma.note.count();
  const totalProposals = await prisma.proposal.count();
  const totalOperations = await prisma.dealOperation.count();
  console.log(`Seeding complete! Neon DB now has ${totalLeads} leads, ${totalNotes} notes, ${totalProposals} proposals, ${totalOperations} operations.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
