'use server'

import { headers } from "next/headers";

import { ApiHandler } from "@/lib/api-handler"
import { auth } from "@/lib/auth";
import { handlePrismaError } from "@/lib/exceptions/prisma-error-handler"
import { ServerActionError } from "@/lib/exceptions/server-action-error"
import prisma from "@/lib/prisma"
import { carRegistrationSchema } from "@/schemas/validation/car-schema"

import { findDriver } from "../driver/find-driver"
import { getUserById } from "../register/user/get-user"

export async function createCarModel(userId: string, data: any) {
  try {
    // Authentication check
  const session = await auth.api.getSession({
    headers: await headers(),
  })

    if (!session) {
      throw ServerActionError.AuthenticationFailed('create-car-model.ts', 'createCarModel')
    }

    // Validate input data
    const validatedData = carRegistrationSchema.parse(data)

    //buscar patente

    const existingPlate = await prisma.car.findFirst({
      where: { plate: validatedData.car.plate.toUpperCase() }
    })

    if (existingPlate) {
      throw ServerActionError.DuplicateEntry('create-car-model.ts', 'createCarModel', `La patente ${validatedData.car.plate.toUpperCase()} ya está registrada`)
    }

    // Run all database operations in a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Primero buscar o crear la marca
      const existingBrand = await tx.brand.findFirst({
        where: { name: validatedData.brand.name }
      })

      const brand = existingBrand || await tx.brand.create({
        data: { name: validatedData.brand.name }
      }).catch(error => {
        throw handlePrismaError(error, 'createCarModel.car', 'create-car-model.ts')
      })

      // 2. Buscar o crear el modelo del carro
      const existingCarModel = await tx.carModel.findFirst({
        where: {
          brandId: brand.id,
          model: validatedData.model.name,
          // year: validatedData.model.year
        }
      })

      const carModel = existingCarModel || await tx.carModel.create({
        data: {
          brandId: brand.id,
          model: validatedData.model.name,
          fuelType: validatedData.model.fuelType,
          averageFuelConsume: validatedData.model.averageFuelConsume
        }
      }).catch(error => {
        throw handlePrismaError(error, 'createCarModel.car', 'create-car-model.ts')
      })

      // 3.Buscar o crear car with plate number

      const existingCar = await tx.car.findFirst({
        where: { plate: validatedData.car.plate.toUpperCase() }
      })

      const car = existingCar || await tx.car.create({
        data: {
          plate: validatedData.car.plate.toUpperCase(),
          carModelId: carModel.id,
          year: validatedData.model.year,
        }
      }).catch(error => {
        throw handlePrismaError(error, 'createCarModel.car', 'create-car-model.ts')
      })

      //Buscar driver

      const driver = await findDriver(userId, tx)

      // 4. Create driver-car relationship
      const driverCar = await tx.driverCar.create({
        data: {
          driverId: driver.id,
          carId: car.id
        }
      }).catch(error => {
        throw handlePrismaError(error, 'createCarModel.driverCar', 'create-car-model.ts')
      })

      return {
        brand,
        carModel,
        car,
        driverCar
      }
    })

    const updatedUser = await getUserById();

    return ApiHandler.handleSuccess(
      updatedUser,
      'Vehículo registrado exitosamente'
    )

  } catch (error) {
    throw error
  }
}