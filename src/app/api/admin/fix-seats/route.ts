import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  // Verificar que solo se pueda acceder en entorno de desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Solo disponible en desarrollo' }, { status: 403 });
  }

  try {
    console.log('Iniciando corrección de remaining seats...');
    
    // Obtener todos los viajes activos o pendientes
    const trips = await prisma.trip.findMany({
      where: {
        status: {
          in: ['PENDING', 'ACTIVE']
        }
      }
    });
    
    console.log(`Encontrados ${trips.length} viajes para actualizar`);
    
    const results = [];
    
    for (const trip of trips) {
      // Calcular asientos ocupados
      const reservations = await prisma.tripPassenger.findMany({
        where: {
          tripId: trip.id,
          reservationStatus: { in: ['APPROVED', 'CONFIRMED'] }
        }
      });
      
      const occupiedSeats = reservations.reduce((sum, r) => sum + r.seatsReserved, 0);
      const correctRemainingSeats = trip.availableSeats - occupiedSeats;
      
      // Actualizar remaining seats
      const logMessage = `Trip ${trip.id}: asientos totales=${trip.availableSeats}, ocupados=${occupiedSeats}, disponibles=${correctRemainingSeats}`;
      console.log(logMessage);
      results.push(logMessage);
      
      await prisma.trip.update({
        where: { id: trip.id },
        data: {
          remainingSeats: correctRemainingSeats,
          isFull: correctRemainingSeats <= 0
        }
      });
    }
    
    console.log('Remaining seats actualizados exitosamente');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Remaining seats actualizados exitosamente',
      results
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error al actualizar remaining seats' },
      { status: 500 }
    );
  }
}