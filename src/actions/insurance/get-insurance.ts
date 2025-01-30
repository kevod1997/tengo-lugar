'use server'

export async function getInsuranceCompanies() {
  const companies = await prisma.insurance.findMany({
    select: {
      id: true,
      name: true
    }
  })
  return companies
}