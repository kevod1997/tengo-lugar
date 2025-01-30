
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const insuranceData = require('./data/aseguradoras.json');

async function main() {
  console.log('Starting seeding...')

  // Clear existing data (optional)
  await prisma.insurance.deleteMany()

  // Insert insurance companies
  interface InsuranceData {
    aseguradoras_PAT: string[];
  }

  const insurers = await Promise.all(
    (insuranceData as InsuranceData).aseguradoras_PAT.map(async (name: string) => {
      return prisma.insurance.create({
        data: {
          name: name.trim()
        }
      })
    })
  )

  console.log(`Created ${insurers.length} insurance records`)
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })