// src/actions/driver/driver-eligibility.ts
'use server'

import prisma from "@/lib/prisma";

export async function checkDriverEligibility(userId: string) {
    const driver = await prisma.driver.findFirst({
        where: { userId },
        include: {
            user: { include: { identityCard: true } },
            licence: true,
            cars: {
                include: {
                    car: {
                        include: {
                            carModel: true,
                            insuredCar: { include: { currentPolicy: true } }
                        }
                    },
                    vehicleCards: true
                }
            }
        }
    });

    if (!driver) return { isEnabled: false, reason: "No es conductor" };

    // 1. Validar identidad verificada
    const hasValidIdentity = driver.user.identityCard?.status === 'VERIFIED';

    // 2. Validar licencia verificada  
    const hasValidLicense = driver.licence?.status === 'VERIFIED';

    // 3. Validar al menos un auto completo
    const hasEnabledCar = driver.cars.some(driverCar => {
        const hasCard = driverCar.vehicleCards.some(card =>
            ['GREEN', 'BLUE'].includes(card.cardType) && card.status === 'VERIFIED'
        );
        const hasInsurance = driverCar.car.insuredCar?.currentPolicy?.status === 'VERIFIED';
        const hasSpecs = driverCar.car.carModel?.fuelType && driverCar.car.carModel?.averageFuelConsume;

        return hasCard && hasInsurance && hasSpecs;
    });

    const isEnabled = hasValidIdentity && hasValidLicense && hasEnabledCar;

    let reason = "";
    if (!hasValidIdentity) reason += "Identidad no verificada. ";
    if (!hasValidLicense) reason += "Licencia no verificada. ";
    if (!hasEnabledCar) reason += "Sin vehículo habilitado. ";

    return { isEnabled, reason: reason.trim() };
}

export async function updateDriverStatus(userId: string) {
    const eligibility = await checkDriverEligibility(userId);

    await prisma.driver.update({
        where: { userId },
        data: {
            isEnabled: eligibility.isEnabled,
            enabledAt: eligibility.isEnabled ? new Date() : null,
            disabledReason: eligibility.isEnabled ? null : eligibility.reason,
            lastEligibilityCheck: new Date()
        }
    });

    return eligibility;
}

export async function getDriverEligibility(userId: string) {
    const driver = await prisma.driver.findFirst({
        where: { userId },
        select: {
            isEnabled: true,
            disabledReason: true,
            lastEligibilityCheck: true
        }
    });

    console.log("Driver eligibility check for user:", userId, "Result:", driver);

    if (!driver) {
        return { isEnabled: false, reason: "No es conductor" };
    }

    if (!driver.disabledReason) {
        const reCheckedDriver = await updateDriverStatus(userId);
        return { isEnabled: reCheckedDriver.isEnabled, reason: reCheckedDriver.reason };
    }


    return {
        isEnabled: driver.isEnabled,
        reason: driver.disabledReason || "",
        lastEligibilityCheck: driver.lastEligibilityCheck || null
    };
}