import { useCallback, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useUserStore } from "@/store/user-store"
import { allSteps, driverStepIds, FormData, StepId, travelerStepIds, UserRole } from "@/types/registration-types"
import { VerificationStatus } from "@prisma/client"
import { DriverRegistrationService } from "@/services/registration/driver-service"
import { UserRegistrationService } from "@/services/registration/user-service"
import { FormattedUser } from "@/types/user-types"
import { useApiResponse } from "../ui/useApiResponse"

export function useRegistrationFlow(initialStep: StepId, onComplete: () => void, onClose: (() => void) | undefined, initialRole?: UserRole) {
    // Estados
    const router = useRouter()
    const { user, setUser } = useUserStore()
    const [currentStepId, setCurrentStepId] = useState(initialStep)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState<FormData>(() => ({
        role: initialRole || null,
        personalInfo: null,
        identityCard: null,
        driverLicense: null,
        carInfo: null,
        insurance: null,
        carCard: null,
    }))
    const [userProfile, setUserProfile] = useState<FormattedUser | null>(null)

    // Memos
    // const steps = useMemo(() => {
    //     // If no role selected, only show role selection
    //     if (!formData.role) return [allSteps.role]

    //     // Get initial steps based on role
    //     let stepIds = formData.role === 'driver' ? [...driverStepIds] : [...travelerStepIds]

    //     // Filter steps based on user state and verification status
    //     if (user?.termsAccepted) {
    //         stepIds = stepIds.filter(id => id !== 'personalInfo')
    //     }

    //     // Handle identity verification
    //     if (user?.identityStatus === VerificationStatus.VERIFIED ||
    //         user?.identityStatus === VerificationStatus.PENDING) {
    //         stepIds = stepIds.filter(id => id !== 'identityCard')
    //     }

    //     // Handle driver-specific verifications
    //     if (formData.role === 'driver') {
    //         // Filter out license step if already verified or pending
    //         if (user?.licenseStatus === VerificationStatus.VERIFIED ||
    //             user?.licenseStatus === VerificationStatus.PENDING) {
    //             stepIds = stepIds.filter(id => id !== 'driverLicense')
    //         }

    //         // Handle car verification
    //         if (user?.hasRegisteredCar) {
    //             stepIds = stepIds.filter(id => id !== 'carInfo')
    //         }

    //         // Handle insurance verification separately
    //         if (user?.allCarsInsured && !user?.hasPendingInsurance) {
    //             stepIds = stepIds.filter(id => id !== 'insurance')
    //         }
    //     }

    //     // Ensure current step is included if it was filtered
    //     if (!stepIds.includes(currentStepId) && currentStepId !== 'role') {
    //         stepIds.push(currentStepId)
    //     }

    //     return stepIds.map(id => allSteps[id])
    // }, [
    //     formData.role,
    //     currentStepId,
    //     user?.termsAccepted,
    //     user?.identityStatus,
    //     user?.licenseStatus,
    //     user?.hasRegisteredCar,
    //     user?.allCarsInsured,
    //     user?.hasPendingInsurance
    // ])

    const steps = useMemo(() => {
        if (!formData.role) return [allSteps.role]

        let stepIds = formData.role === 'driver' ? [...driverStepIds] : [...travelerStepIds]

        if (user?.termsAccepted) {
            stepIds = stepIds.filter(id => id !== 'personalInfo')
        }

        if (user?.identityStatus === VerificationStatus.VERIFIED ||
            user?.identityStatus === VerificationStatus.PENDING) {
            stepIds = stepIds.filter(id => id !== 'identityCard')
        }

        if (formData.role === 'driver') {
            if (user?.licenseStatus === VerificationStatus.VERIFIED ||
                user?.licenseStatus === VerificationStatus.PENDING) {
                stepIds = stepIds.filter(id => id !== 'driverLicense')
            }

            if (user?.hasRegisteredCar) {
                stepIds = stepIds.filter(id => id !== 'carInfo')
            }

            if (user?.allCarsInsured && !user?.hasPendingInsurance) {
                stepIds = stepIds.filter(id => id !== 'insurance')
            }

            if (user?.hasAllRequiredCards && !user?.hasPendingCards) {
                stepIds = stepIds.filter(id => id !== 'carCard')
            }
        }

        if (!stepIds.includes(currentStepId) && currentStepId !== 'role') {
            stepIds.push(currentStepId)
        }

        return stepIds.map(id => allSteps[id])
    }, [
        formData.role,
        currentStepId,
        user?.termsAccepted,
        user?.identityStatus,
        user?.licenseStatus,
        user?.hasRegisteredCar,
        user?.allCarsInsured,
        user?.hasPendingInsurance,
        user?.hasAllRequiredCards,
        user?.hasPendingCards
    ])

    const currentStepIndex = useMemo(() =>
        steps.findIndex(step => step.id === currentStepId)
        , [steps, currentStepId])

    const totalSteps = useMemo(() => steps.length, [steps])

    const currentStep = useMemo(() =>
        steps.find(step => step.id === currentStepId) || steps[0]
        , [steps, currentStepId])

    // FUNCIONES DE NAVEGACIÓN

    const moveToNextStep = () => {
        const nextStepId = steps[currentStepIndex + 1]?.id
        if (nextStepId) setCurrentStepId(nextStepId as StepId)
    }

    // MANEJO DE FLUJOS DE REGISTRO

    const getUserId = () => {
        if (userProfile?.id) {
            return userProfile.id
        }

        if (user?.id) {
            return user.id
        }

        // Si no hay ningún ID disponible, lanza un error
        throw new Error('No se encontró un ID de usuario válido')
    }

    // MANEJADORES PRINCIPALES

    const handleTravelerFlow = async (stepId: string, data: any) => {
        const { handleResponse } = useApiResponse()
        const userRegistrationService = new UserRegistrationService()
        setIsLoading(true)

        try {
            switch (stepId) {
                case 'personalInfo':
                    const createdUser = await userRegistrationService.createBaseProfile(data)
                    setUserProfile(createdUser.data as FormattedUser)
                    handleResponse({ success: createdUser.success, message: createdUser.message })
                    moveToNextStep()
                    break;

                case 'identityCard':
                    const userId = getUserId()
                    const identityCardResult = await userRegistrationService.uploadIdentityCard(userId, data, user?.identityStatus ?? null)
                    handleResponse({ success: identityCardResult.success, message: identityCardResult.message })

                    if (identityCardResult.success) {
                        setUser(identityCardResult.data!)
                        router.refresh()
                        onClose?.()
                        onComplete()
                    }
                    break;
            }
        } catch (error) {
            handleResponse({ success: false, message: (error as Error).message })
        } finally {
            setIsLoading(false)
        }
    }

    const handleDriverFlow = async (stepId: string, data: any) => {
        const { handleResponse } = useApiResponse()
        const userId = getUserId()
        const userRegistrationService = new UserRegistrationService()
        const driverService = new DriverRegistrationService()
        setIsLoading(true)

        try {
            switch (stepId) {
                case 'personalInfo':
                    const createdUser = await userRegistrationService.createBaseProfile(data)
                    handleResponse({ success: createdUser.success, message: createdUser.message })
                    if (createdUser.success) {
                        setUserProfile(createdUser.data as FormattedUser)
                        moveToNextStep()
                    }
                    break;

                case 'identityCard':
                    if (data) {
                        const identityCardResult = await userRegistrationService.uploadIdentityCard(userId, data, user?.identityStatus ?? null)
                        handleResponse({ success: identityCardResult.success, message: identityCardResult.message })
                        if (identityCardResult.success) {
                            setUserProfile(identityCardResult.data!);
                            moveToNextStep()
                        }
                    }
                    break;

                case 'driverLicense':
                    if (data) {
                        const uploadResult = await driverService.uploadDriverLicense(userId, data, user?.licenseStatus ?? null)
                        handleResponse({ success: uploadResult.success, message: uploadResult.message })
                        if (uploadResult.success) {
                            setUser(uploadResult.data!)
                            moveToNextStep()
                        }
                    }
                    break;

                case 'carInfo':
                    if (data) {
                        const carInfoResult = await driverService.submitCarInfo(userId, data)
                        handleResponse({ success: carInfoResult.success, message: carInfoResult.message })
                        if (carInfoResult.success) {
                            setUser(carInfoResult.data!)
                            moveToNextStep()
                        }
                    }
                    break;

                case 'insurance':
                    if (data) {
                        const insuranceResult = await driverService.submitInsurance(userId, data, user?.cars[0].insurance.status ?? null)
                        handleResponse({ success: insuranceResult.success, message: insuranceResult.message })
                        if (insuranceResult.success) {
                            setUser(insuranceResult.data!)
                            moveToNextStep()
                        }
                    }
                    break;

                case 'carCard':
                    if (data) {
                        const carCard = await driverService.submitCardCar(userId, data, user?.cars[0].vehicleCard?.status ?? null)
                        handleResponse({ success: carCard.success, message: carCard.message })
                        if (carCard.success) {
                            setUser(carCard.data!)
                            router.refresh()
                            onComplete()
                        }
                    }
                    break;
            }
        } catch (error) {
            handleResponse({ success: false, message: (error as Error).message })
        } finally {
            setIsLoading(false)
        }
    }

    // const handleRoleSelection = useCallback((role: UserRole) => {
    //     const selectedRole = initialRole || role;
    //     setFormData((prev: any) => ({ ...prev, role: selectedRole }));

    //     // Check which steps are needed
    //     const needsPersonalInfo = !user?.termsAccepted;
    //     const needsIdentity = user?.identityStatus === null ||
    //         user?.identityStatus === VerificationStatus.FAILED;
    //     const needsLicense = selectedRole === 'driver' &&
    //         (user?.licenseStatus === null ||
    //             user?.licenseStatus === VerificationStatus.FAILED);
    //     const needsCarInfo = selectedRole === 'driver' && !user?.hasRegisteredCar;
    //     const needsInsurance = selectedRole === 'driver' &&
    //         (!user?.allCarsInsured || user?.hasPendingInsurance);


    //     // If all verifications are complete, we can finish
    //     if (!needsPersonalInfo && !needsIdentity && !needsLicense &&
    //         !needsCarInfo && !needsInsurance) {
    //         return null;
    //     }

    //     // Find the first required step
    //     const nextStep = needsPersonalInfo ? 'personalInfo' :
    //         needsIdentity ? 'identityCard' :
    //             needsLicense ? 'driverLicense' :
    //                 needsCarInfo ? 'carInfo' :
    //                     needsInsurance ? 'insurance' : null;

    //     if (nextStep) {
    //         setCurrentStepId(nextStep as StepId);
    //     }
    // }, [user, initialRole]);

    const handleRoleSelection = useCallback((role: UserRole) => {
        const selectedRole = initialRole || role;
        setFormData((prev: any) => ({ ...prev, role: selectedRole }));

        // Check which steps are needed
        const needsPersonalInfo = !user?.termsAccepted;
        const needsIdentity = user?.identityStatus === null ||
            user?.identityStatus === VerificationStatus.FAILED;
        const needsLicense = selectedRole === 'driver' &&
            (user?.licenseStatus === null ||
                user?.licenseStatus === VerificationStatus.FAILED);
        const needsCarInfo = selectedRole === 'driver' && !user?.hasRegisteredCar;
        const needsInsurance = selectedRole === 'driver' &&
            (!user?.allCarsInsured || user?.hasPendingInsurance);
        const needsVehicleCards = selectedRole === 'driver' &&
            (!user?.hasAllRequiredCards || user?.hasPendingCards);

        // If all verifications are complete, we can finish
        if (!needsPersonalInfo && !needsIdentity && !needsLicense &&
            !needsCarInfo && !needsInsurance && !needsVehicleCards) {
            return null;
        }

        // Find the first required step
        const nextStep = needsPersonalInfo ? 'personalInfo' :
            needsIdentity ? 'identityCard' :
                needsLicense ? 'driverLicense' :
                    needsCarInfo ? 'carInfo' :
                        needsInsurance ? 'insurance' :
                            needsVehicleCards ? 'carCard' : null;

        if (nextStep) {
            setCurrentStepId(nextStep as StepId);
        }
    }, [user, initialRole]);

    const handleNext = useCallback(async (data: any) => {
        if (currentStep.id === 'role') {
            handleRoleSelection(data)
            return
        }

        setFormData((prev: any) => ({ ...prev, [currentStep.id]: data }))
        if (formData.role === 'traveler') {
            await handleTravelerFlow(currentStep.id, data)
        } else {
            await handleDriverFlow(currentStep.id, data)
        }
    }, [currentStep, formData.role])

    return {
        currentStep,
        currentStepIndex,
        steps,
        totalSteps,
        formData,
        isLoading,
        handleNext,
        setFormData,
        userProfile,
        setUser,
        setIsLoading,
        user,
    }
}

