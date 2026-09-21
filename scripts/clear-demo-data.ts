import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing all demo data from Prisma SQLite database...');
  await prisma.operationNote.deleteMany();
  await prisma.dealOperation.deleteMany();
  await prisma.note.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.visit.deleteMany();
  await prisma.lead.deleteMany();
  console.log('Database successfully cleaned! Ready for production work.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
