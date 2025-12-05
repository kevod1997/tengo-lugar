'use server'

import { ApiHandler } from "@/lib/api-handler"
import prisma from "@/lib/prisma"

export async function checkPlateExists(plate: string) {
  try {
    const existingCar = await prisma.car.findFirst({
      where: { 
        plate: plate.toUpperCase() 
      }
    })

    return ApiHandler.handleSuccess({
      exists: !!existingCar,
      message: existingCar ? 'La patente ya está registrada' : null
    })
  } catch (error) {
    return ApiHandler.handleError(error)
  }
}