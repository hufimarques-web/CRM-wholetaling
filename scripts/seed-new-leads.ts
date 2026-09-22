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

  const totalLeads = await prisma.lead.count();
  const totalNotes = await prisma.note.count();
  console.log(`Seeding complete! Database now has ${totalLeads} leads and ${totalNotes} notes.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
