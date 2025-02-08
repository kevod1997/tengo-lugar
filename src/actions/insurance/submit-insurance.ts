'use server'

import { ApiHandler } from "@/lib/api-handler"
import { handlePrismaError } from "@/lib/exceptions/prisma-error-handler"
import { ServerActionError } from "@/lib/exceptions/server-action-error"
import prisma from "@/lib/prisma"
import { InsuranceInput, insuranceSchema } from "@/schemas/validation/insurance-schema"
import { auth } from "@clerk/nextjs/server"
import { FileType } from "@prisma/client"
import { uploadDocuments } from "@/lib/file/upload-documents"
import { z } from "zod"
import { getUserByClerkId } from "../register/user/get-user"

export async function submitInsuranceInfo(userId: string, insuranceInfo: InsuranceInput) {
    try {
        // Verificación de autenticación
        const { userId: clerkId } = await auth()
        if (!clerkId) {
            throw ServerActionError.AuthenticationFailed(
                'submit-insurance-info.ts',
                'submitInsuranceInfo'
            )
        }

        // Validación de datos con nuestro schema mejorado
        const validatedData = insuranceSchema.parse(insuranceInfo)

        // Ejecutamos todas las operaciones en una transacción
        await prisma.$transaction(async (tx) => {
            // Buscamos el driver y su información relacionada
            const driver = await tx.driver.findUnique({
                where: { userId },
                include: {
                    user: true,
                    Car: {
                        include: {
                            car: {
                                include: {
                                    insuredCar: {
                                        include: {
                                            currentPolicy: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            })

            // Verificamos que el conductor tenga un auto asignado
            if (!driver?.Car || driver.Car.length === 0) {
                throw ServerActionError.ValidationFailed(
                    'submit-insurance.ts',
                    'submitInsuranceInfo',
                    'Debe registrar un vehículo antes de cargar el seguro'
                )
            }

            //todo esto hay que optimizarlo bien  para que sea el auto el que se valide bien, para ser reutilizable
            const car = driver.Car[0].car

            // Verificamos si ya existe una póliza activa
            if (car.insuredCar?.currentPolicy) {
                const currentPolicy = car.insuredCar.currentPolicy
                const today = new Date()
                if (
                    currentPolicy.status === 'VERIFIED' &&
                    new Date(currentPolicy.expireDate) > today
                ) {
                    throw ServerActionError.ValidationFailed(
                        'submit-insurance.ts',
                        'submitInsuranceInfo',
                        'El vehículo ya tiene una póliza activa y verificada'
                    )
                }
            }

            // Preparamos la información del usuario para la carga de archivos
            const userInfo = {
                id: driver.user.id,
                firstName: driver.user.firstName,
                lastName: driver.user.lastName
            }

            // El archivo ya viene procesado del client-side
            const uploadResult = await uploadDocuments(
                validatedData.policyFile,
                undefined,
                userInfo,
                'insurance',
                car.plate
            )

            if (!uploadResult.frontFileKey) {
                throw ServerActionError.ValidationFailed(
                    'submit-insurance.ts',
                    'submitInsuranceInfo',
                    'Error al procesar el archivo de la póliza'
                )
            }

            // Creamos o actualizamos el InsuredCar
            const insuredCar = await tx.insuredCar.upsert({
                where: {
                    id: car.insuredCarId || ''
                },
                create: {
                    cars: {
                        connect: { id: car.id }
                    }
                },
                update: {}
            }).catch(error => {
                throw handlePrismaError(error, 'submitInsuranceInfo.insuredCar', 'submit-insurance.ts')
            })

            const existingPolicy = await tx.insurancePolicy.findFirst({
                where: {
                    insuredCarId: insuredCar.id,
                    status: 'FAILED'
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            let policy;
            if (existingPolicy) {
                policy = await tx.insurancePolicy.update({
                    where: { id: existingPolicy.id },
                    data: {
                        policyNumber: validatedData.policyNumber,
                        startDate: validatedData.startDate,
                        expireDate: validatedData.expireDate,
                        fileKey: uploadResult.frontFileKey,
                        fileType: validatedData.policyFile?.file?.type === 'application/pdf'
                            ? FileType.PDF
                            : FileType.IMAGE,
                        status: 'PENDING',
                        failureReason: null,
                        verifiedAt: null,
                        insurance: {
                            connect: { id: validatedData.insuranceId }
                        }
                    },
                    include: {
                        insurance: true
                    }
                });
            } else {
                policy = await tx.insurancePolicy.create({
                    data: {
                        policyNumber: validatedData.policyNumber,
                        startDate: validatedData.startDate,
                        expireDate: validatedData.expireDate,
                        fileKey: uploadResult.frontFileKey,
                        fileType: validatedData.policyFile?.file?.type === 'application/pdf'
                            ? FileType.PDF
                            : FileType.IMAGE,
                        insurance: {
                            connect: { id: validatedData.insuranceId }
                        },
                        insuredCar: {
                            connect: { id: insuredCar.id }
                        }
                    },
                    include: {
                        insurance: true
                    }
                });
            }

            // Actualizamos el InsuredCar con la nueva póliza actual
            if (existingPolicy?.id !== policy.id) {
                await tx.insuredCar.update({
                    where: { id: insuredCar.id },
                    data: { currentPolicyId: policy.id }
                }).catch(error => {
                    throw handlePrismaError(error, 'submitInsuranceInfo.updateCurrentPolicy', 'submit-insurance.ts')
                });
            }

            // Si el auto no estaba asegurado, actualizamos la referencia
            if (!car.insuredCarId) {
                await tx.car.update({
                    where: { id: car.id },
                    data: {
                        insuredCarId: insuredCar.id
                    }
                }).catch(error => {
                    throw handlePrismaError(error, 'submitInsuranceInfo.updateCar', 'submit-insurance.ts')
                })
            }
        })

        const updatedUser = await getUserByClerkId();


        return {
            success: true,
            data: {
                updatedUser,
                message: 'Póliza de seguro cargada exitosamente',
            }
        }

    } catch (error) {
        if (error instanceof z.ZodError) {
            // Manejar errores de validación específicamente
            const errorMessages = error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));

            throw ServerActionError.ValidationFailed(
                'submit-insurance.ts',
                'submitInsuranceInfo',
                JSON.stringify(errorMessages)
            );
        }
        return ApiHandler.handleError(error)
    }
}