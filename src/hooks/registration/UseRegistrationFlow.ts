import { useCallback, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useUserStore } from "@/store/user-store"
import { allSteps, driverStepIds, FormData, StepId, travelerStepIds, UserRole } from "@/types/registration-types"
import { VerificationStatus } from "@prisma/client"
import { DriverRegistrationService } from "@/services/registration/driver-service"
import { UserRegistrationService } from "@/services/registration/user-service"
import { FormattedUser } from "@/types/user-types"
import { useApiResponse } from "../ui/useApiResponse"
import { authClient } from "@/lib/auth-client"

export function useRegistrationFlow(initialStep: StepId, onComplete: () => void, onClose: (() => void) | undefined, initialRole?: UserRole) {
    // Estados
    const router = useRouter()
    const { user, setUser } = useUserStore()
    const { data } = authClient.useSession()
    const userId = data?.user.id
    const { handleResponse } = useApiResponse()
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

    const moveToNextStep = useCallback(() => {
        const nextStepId = steps[currentStepIndex + 1]?.id
    
        if (nextStepId) {
            setCurrentStepId(nextStepId as StepId)
        }
    }, [steps, currentStepIndex]);

    // MANEJADORES PRINCIPALES

    const handleTravelerFlow = useCallback(async (stepId: string, data: any, userId: string) => {
        const userRegistrationService = new UserRegistrationService();
        setIsLoading(true);
      
        try {
          switch (stepId) {
            case 'personalInfo':
              {
                const createdUser = await userRegistrationService.createBaseProfile(userId, data);
                handleResponse({ success: createdUser.success, message: createdUser.message });
                if (createdUser.success) {
                  setUser(createdUser.data as FormattedUser);
                  moveToNextStep();
                }
              }
              break;
      
            case 'identityCard':
              {
                const identityCardResult = await userRegistrationService.uploadIdentityCard(userId, data, user?.identityStatus ?? null);
                handleResponse({ success: identityCardResult.success, message: identityCardResult.message });
      
                if (identityCardResult.success) {
                  setUser(identityCardResult.data!);
                  router.refresh();
                  onClose?.();
                  onComplete();
                }
              }
              break;
          }
        } catch (error) {
          handleResponse({ success: false, message: (error as Error).message });
        } finally {
          setIsLoading(false);
        }
      }, [
        setIsLoading, 
        handleResponse, 
        user?.identityStatus, 
        setUser, 
        moveToNextStep, 
        router, 
        onClose, 
        onComplete
      ]);
      
      const handleDriverFlow = useCallback(async (stepId: string, data: any, userId: string) => {
        const userRegistrationService = new UserRegistrationService();
        const driverService = new DriverRegistrationService();
        setIsLoading(true);
      
        try {
          switch (stepId) {
            case 'personalInfo':
              {
                const createdUser = await userRegistrationService.createBaseProfile(userId, data);
                handleResponse({ success: createdUser.success, message: createdUser.message });
                if (createdUser.success) {
                  setUser(createdUser.data as FormattedUser);
                  moveToNextStep();
                }
              }
              break;
      
            case 'identityCard':
              if (data) {
                const identityCardResult = await userRegistrationService.uploadIdentityCard(userId, data, user?.identityStatus ?? null);
                handleResponse({ success: identityCardResult.success, message: identityCardResult.message });
                if (identityCardResult.success) {
                  setUser(identityCardResult.data!);
                  moveToNextStep();
                }
              }
              break;
      
            case 'driverLicense':
              if (data) {
                const uploadResult = await driverService.uploadDriverLicense(userId, data, user?.licenseStatus ?? null);
                handleResponse({ success: uploadResult.success, message: uploadResult.message });
                if (uploadResult.success) {
                  setUser(uploadResult.data!);
                  moveToNextStep();
                }
              }
              break;
      
            case 'carInfo':
              if (data) {
                const carInfoResult = await driverService.submitCarInfo(userId, data);
                handleResponse({ success: carInfoResult.success, message: carInfoResult.message });
                if (carInfoResult.success) {
                  setUser(carInfoResult.data!);
                  moveToNextStep();
                }
              }
              break;
      
            case 'insurance':
              if (data) {
                const insuranceResult = await driverService.submitInsurance(userId, data, user?.cars[0].insurance.status ?? null);
                handleResponse({ success: insuranceResult.success, message: insuranceResult.message });
                if (insuranceResult.success) {
                  setUser(insuranceResult.data!);
                  moveToNextStep();
                }
              }
              break;
      
            case 'carCard':
              if (data) {
                const carCard = await driverService.submitCardCar(userId, data, user?.cars[0].vehicleCard?.status ?? null);
                handleResponse({ success: carCard.success, message: carCard.message });
                if (carCard.success) {
                  setUser(carCard.data!);
                  router.refresh();
                  onComplete();
                }
              }
              break;
          }
        } catch (error) {
          handleResponse({ success: false, message: (error as Error).message });
        } finally {
          setIsLoading(false);
        }
      }, [
        setIsLoading, 
        handleResponse, 
        user?.identityStatus, 
        user?.licenseStatus, 
        user?.cars, 
        setUser, 
        moveToNextStep, 
        router, 
        onComplete
      ]);

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
            await handleTravelerFlow(currentStep.id, data, userId!)
        } else {
            await handleDriverFlow(currentStep.id, data, userId!)
        }
    }, [currentStep, formData.role, handleRoleSelection, handleDriverFlow, handleTravelerFlow, userId])

    return {
        currentStep,
        currentStepIndex,
        steps,
        totalSteps,
        formData,
        isLoading,
        handleNext,
        setFormData,
        setIsLoading,
    }
}

