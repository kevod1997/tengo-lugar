// src/app/api/seed/route.ts
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
// Import the JSON file directly
import insuranceData from "@/seed/data/aseguradoras.json";

// Fuel price data
const fuelPrices = [
  {
    name: "Diesel Común",
    fuelType: "DIESEL",
    price: 1221.19,
  },
  {
    name: "Diesel Premium",
    fuelType: "DIESEL",
    price: 1468.95,
  },
  {
    name: "GNC",
    fuelType: "GNC",
    price: 479.94,
  },
  {
    name: "Nafta Común",
    fuelType: "NAFTA",
    price: 1253.00,
  },
  {
    name: "Nafta Premium",
    fuelType: "NAFTA",
    price: 1471.66,
  },
];

export async function GET() {
  // Verify that this can only be accessed in development environment
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Only available in development environment' }, { status: 403 });
  }

  try {
    console.log('Starting database seed...');
    
    // Seed insurance companies
    console.log('Seeding insurance companies...');
    await prisma.insurance.deleteMany();
    
    const insurers = await Promise.all(
      insuranceData.aseguradoras_PAT.map((name: string) => 
        prisma.insurance.create({
          data: { name: name.trim() }
        })
      )
    );
    console.log(`Created ${insurers.length} insurance records`);

    // Seed terms and conditions
    console.log('Seeding terms and conditions...');
    await prisma.termsAndCondition.deleteMany();
    const terms = await prisma.termsAndCondition.create({
      data: {
        version: "1.0",
        content: "Hola mundo - Términos y condiciones para desarrollo",
        effectiveDate: new Date(),
        isActive: true
      }
    });
    console.log('Created terms and conditions record in version:' + terms.version);

    // Seed fuel prices
    console.log('Seeding fuel prices...');
    await prisma.fuelPrice.deleteMany();
    const effectiveDate = new Date();
    const fuels = await Promise.all(
      fuelPrices.map(fuel => 
        prisma.fuelPrice.create({
          data: {
            name: fuel.name,
            fuelType: fuel.fuelType as any, // Type casting to match your enum
            price: fuel.price,
            effectiveDate,
            isActive: true
          }
        })
      )
    );
    console.log(`Created ${fuels.length} fuel price records`);

    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded successfully',
      data: {
        insurers: insurers.length,
        terms: 1,
        fuels: fuels.length
      }
    });
  } catch (error) {
    console.error('Error during seeding:', error);
    return NextResponse.json(
      { 
        error: 'Failed to seed database', 
        details: (error as Error).message,
        stack: (error as Error).stack
      },
      { status: 500 }
    );
  }
}