'use server'

import { handlePrismaError } from "@/lib/exceptions/prisma-error-handler"
import { ServerActionError } from "@/lib/exceptions/server-action-error"
import prisma from "@/lib/prisma"
import { InsuranceInput, insuranceSchema } from "@/schemas/validation/insurance-schema"
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { FileType } from "@prisma/client"
import { uploadDocuments } from "@/lib/file/upload-documents"
import { z } from "zod"
import { getUserById } from "../register/user/get-user"
import { splitFullName } from "@/utils/format/user-formatter"

export async function submitInsuranceInfo(userId: string, insuranceInfo: InsuranceInput) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        })

        if (!session) {
            throw ServerActionError.AuthenticationFailed(
                'submit-insurance-info.ts',
                'submitInsuranceInfo'
            )
        }

        const validatedData = insuranceSchema.parse(insuranceInfo)

        await prisma.$transaction(async (tx) => {
            // Buscamos el driver con la relación específica del auto
            const driver = await tx.driver.findUnique({
                where: { userId },
                include: {
                    user: true,
                }
            })

            if (!driver) {
                throw ServerActionError.NotFound(
                    'submit-insurance.ts',
                    'submitInsuranceInfo',
                    'Conductor no encontrado'
                )
            }

            // Buscamos la relación específica conductor-auto
            const driverCar = await tx.driverCar.findFirst({
                where: {
                    driverId: driver.id,
                    car: {
                        plate: validatedData.carPlate
                    }
                },
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
            })

            if (!driverCar) {
                throw ServerActionError.ValidationFailed(
                    'submit-insurance.ts',
                    'submitInsuranceInfo',
                    'No se encontró el vehículo especificado o no está asociado al conductor'
                )
            }

            const car = driverCar.car

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
            const { firstName, lastName } = splitFullName(driver.user.name)

            const userInfo = {
                id: driver.user.id,
                firstName,
                lastName
            }

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

            if (existingPolicy?.id !== policy.id) {
                await tx.insuredCar.update({
                    where: { id: insuredCar.id },
                    data: { currentPolicyId: policy.id }
                }).catch(error => {
                    throw handlePrismaError(error, 'submitInsuranceInfo.updateCurrentPolicy', 'submit-insurance.ts')
                });
            }

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

        const updatedUser = await getUserById();

        return {
            success: true,
            data: {
                updatedUser,
                message: 'Póliza de seguro cargada exitosamente',
            }
        }

    } catch (error) {
        if (error instanceof z.ZodError) {
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
        // return ApiHandler.handleError(error)
        throw error
    }
}