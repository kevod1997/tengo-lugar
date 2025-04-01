'use server'

import { ServerActionError } from "@/lib/exceptions/server-action-error"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { FileType } from "@prisma/client"
import { z } from "zod"
import { uploadDocuments } from "@/lib/file/upload-documents"
import { vehicleCardSchema } from "@/schemas/validation/car-card-schema"
import { getUserById } from "../register/user/get-user"
import { splitFullName } from "@/utils/format/user-formatter";

export async function submitCardCarInfo(userId: string, cardCarInfo: any) {
    try {
        // Verificación de autenticación
      const session = await auth.api.getSession({
    headers: await headers(),
  })

        if (!session) {
            throw ServerActionError.AuthenticationFailed(
                'submit-card-car-info.ts',
                'submitCardCarInfo'
            )
        }

        // Validación de datos
        const validatedData = vehicleCardSchema.parse(cardCarInfo)

        // Ejecutamos todas las operaciones en una transacción
        await prisma.$transaction(async (tx) => {
            // Buscamos el driver y su información relacionada
            const driver = await tx.driver.findUnique({
                where: { userId },
                include: {
                    user: true,
                    cars: {
                        where: {
                            carId: validatedData.carId
                        },
                        include: {
                            car: true
                        }
                    }
                }
            })

            if (!driver) {
                throw ServerActionError.NotFound(
                    'submit-card-car-info.ts',
                    'submitCardCarInfo',
                    'Conductor no encontrado'
                )
            }

            const driverCar = driver.cars[0]
            if (!driverCar) {
                throw ServerActionError.NotFound(
                    'submit-card-car-info.ts',
                    'submitCardCarInfo',
                    'Relación conductor-vehículo no encontrada'
                )
            }

            // Verificar si ya existe una tarjeta del mismo tipo
            if (validatedData.cardType === 'GREEN') {
                const existingGreenCard = await tx.vehicleCard.findFirst({
                    where: {
                        carId: validatedData.carId,
                        cardType: 'GREEN'
                    }
                })

                if (existingGreenCard && existingGreenCard.status !== 'FAILED') {
                    throw ServerActionError.ValidationFailed(
                        'submit-card-car-info.ts',
                        'submitCardCarInfo',
                        'Ya existe una tarjeta verde activa para este vehículo'
                    )
                }
            }

            // Preparamos la información del usuario para la carga de archivos

            const {firstName, lastName} = splitFullName(driver.user.name)

            const userInfo = {
                id: driver.user.id,
                firstName,
                lastName
            }

            // Procesar el archivo
            const uploadResult = await uploadDocuments(
                validatedData.cardFile,
                undefined,
                userInfo,
                'car-card',
                driverCar.car.plate
            )

            if (!uploadResult.frontFileKey) {
                throw ServerActionError.ValidationFailed(
                    'submit-card-car-info.ts',
                    'submitCardCarInfo',
                    'Error al procesar el archivo de la tarjeta'
                )
            }

            // Verificar si existe una tarjeta fallida para actualizar
            const existingFailedCard = await tx.vehicleCard.findFirst({
                where: {
                    carId: validatedData.carId,
                    cardType: validatedData.cardType,
                    status: 'FAILED'
                }
            })

            if (existingFailedCard) {
                await tx.vehicleCard.update({
                    where: { id: existingFailedCard.id },
                    data: {
                        expirationDate: validatedData.expirationDate,
                        fileKey: uploadResult.frontFileKey,
                        fileType: FileType.IMAGE,
                        status: 'PENDING',
                        failureReason: null,
                        driverCarId: driverCar.id
                    }
                })
            } else {
                await tx.vehicleCard.create({
                    data: {
                        carId: validatedData.carId,
                        cardType: validatedData.cardType,
                        expirationDate: validatedData.expirationDate,
                        fileKey: uploadResult.frontFileKey,
                        fileType: FileType.IMAGE,
                        driverCarId: driverCar.id
                    }
                })
            }

        })

        const updatedUser = await getUserById();

        return {
            success: true,
            data: {
                updatedUser,
                message: `Tarjeta ${validatedData.cardType === 'BLUE' ? 'Azul' : 'Verde'} subida exitosamente`,
            }
        }

    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }))

            throw ServerActionError.ValidationFailed(
                'submit-card-car-info.ts',
                'submitCardCarInfo',
                JSON.stringify(errorMessages)
            )
        }

        throw error
    }
}