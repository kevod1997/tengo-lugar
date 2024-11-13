import { useState, useCallback, useMemo } from 'react'
import { toast } from "sonner"
import { createUser, getUserByClerkId } from '@/actions/user'
import { Step, UserRole, FormData } from './registration-types'
import { uploadIdentityCard } from '@/actions/identity-card'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/user-store'

// Componentes
import PersonalInfoForm from './personal-info-form'
import IdentityCardForm from './identity-card-form'
import { RoleSelection } from './role-selection'
import { uploadDriverLicense } from '@/actions/license'
import { VerificationStatus } from '@prisma/client'
import DriverLicenseForm from './driver-license-form'

// Definición de pasos
const allSteps: Record<string, Step> = {
    // Bloque 1: Registro Base
    role: { id: 'role', title: 'Rol', component: RoleSelection },
    personalInfo: { id: 'personalInfo', title: 'Información Personal', component: PersonalInfoForm },

    // Bloque 2: Documentos
    identityCard: { id: 'identityCard', title: 'Documento de Identidad', component: IdentityCardForm },
    driverLicense: { id: 'driverLicense', title: 'Licencia de Conducir', component: DriverLicenseForm },

    // Bloque 3: Vehículo
    // carInfo: { id: 'carInfo', title: 'Información del Vehículo', component: IdentityCardForm },
    // insurance: { id: 'insurance', title: 'Seguro del Vehículo', component: IdentityCardForm },
}

const travelerStepIds = ['role', 'personalInfo', 'identityCard']
const driverStepIds = ['role', 'personalInfo', 'identityCard', 'driverLicense']
// , 'carInfo', 'insurance'

export function useRegistrationFlow(initialStep: string, onComplete: (user: any) => void, initialRole?: 'traveler' | 'driver') {
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
        // carInfo: null,
    }))
    const [userProfile, setUserProfile] = useState<any>(null)
    console.log(formData)

    // Memos
    const steps = useMemo(() => {
        if (!formData.role) return [allSteps.role]

        let stepIds = formData.role === 'driver' ? [...driverStepIds] : [...travelerStepIds]

        // Remove steps based on user state
        if (user?.termsAccepted) {
            stepIds = stepIds.filter(id => id !== 'personalInfo')
        }

        if (user?.identityStatus === VerificationStatus.VERIFIED ||
            user?.identityStatus === VerificationStatus.PENDING) {
            stepIds = stepIds.filter(id => id !== 'identityCard')
        }

        if (formData.role === 'driver' &&
            (user?.licenseStatus === VerificationStatus.VERIFIED ||
                user?.licenseStatus === VerificationStatus.PENDING)) {
            stepIds = stepIds.filter(id => id !== 'driverLicense')
        }

        // Always include the current step, even if it would be filtered out
        if (!stepIds.includes(currentStepId) && currentStepId !== 'role') {
            stepIds.push(currentStepId)
        }

        return stepIds.map(id => allSteps[id])
    }, [formData.role, currentStepId, user?.termsAccepted, user?.identityStatus, user?.licenseStatus])

    const currentStepIndex = useMemo(() =>
        steps.findIndex(step => step.id === currentStepId)
        , [steps, currentStepId])

    const totalSteps = useMemo(() => steps.length, [steps])

    const currentStep = useMemo(() =>
        steps.find(step => step.id === currentStepId) || steps[0]
        , [steps, currentStepId])


    // Funciones auxiliares
    const handleApiResult = (result: any, successMessage: string) => {
        if (result.success && result.data) {
            onComplete(result.data)
            toast.success('¡Proceso completado con éxito!', { description: successMessage })
        } else {
            toast.error('Error en el proceso', {
                description: result.error || 'Por favor, inténtalo de nuevo.'
            })
        }
    }

    const handleApiError = () => {
        toast.error('Error en el proceso', {
            description: 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.',
        })
    }

    const moveToNextStep = () => {
        const nextStepId = steps[currentStepIndex + 1]?.id
        if (nextStepId) setCurrentStepId(nextStepId)
    }

    // Manejo de datos del conductor
    const saveStepData = (data: any) => {
        setFormData(prev => ({ ...prev, [currentStep.id]: data }))
        localStorage.setItem(`driver_registration_${currentStep.id}`, JSON.stringify(data))
    }

    const loadSavedStepData = (stepId: string) => {
        try {
            const savedData = localStorage.getItem(`driver_registration_${stepId}`)
            return savedData ? JSON.parse(savedData) : null
        } catch (error) {
            console.error(`Error loading saved data for step ${stepId}:`, error)
            return null
        }
    }

    // Funciones de flujo del viajero
    // const createTravelerWithoutDocument = async () => {
    //     const userResult = await createUser({
    //         ...formData.personalInfo,
    //         role: 'traveler'
    //     })

    //     if (!userResult.success) throw new Error(userResult.error)
    //     handleApiResult(userResult, 'Bienvenido a Tengo Lugar. Su cuenta ha sido creada.')
    // }

    const createTravelerWithoutDocument = async () => {
        const userResult = await createUser({
            ...formData.personalInfo,
            role: 'traveler'
        })

        if (!userResult.success) throw new Error(userResult.error)

        const formattedUser = userResult.data ? await getUserByClerkId(userResult.data.clerkId) : null

        if (!formattedUser) {
            throw new Error('Error al obtener el usuario formateado')
        }

        handleApiResult(userResult, 'Registro completado, recorda que en cualquier momento podes validar tu identidad.')
        return formattedUser
    }

    // const createTravelerWithDocument = async (identityData: any) => {
    //     const userResult = await createUser({
    //         ...formData.personalInfo,
    //         role: 'traveler'
    //     })

    //     if (!userResult.success) throw new Error(userResult.error)

    //     const identityCardResult = await uploadIdentityCard(
    //         userResult.data?.id ?? '',
    //         identityData
    //     )

    //     if (!identityCardResult.success) throw new Error(identityCardResult.error)
    //     handleApiResult(userResult, 'Registro completado exitosamente')
    // }

    const createTravelerWithDocument = async (identityData: any) => {
        const userResult = await createUser({
            ...formData.personalInfo,
            role: 'traveler'
        })

        if (!userResult.success) throw new Error(userResult.error)

        const identityCardResult = await uploadIdentityCard(
            userResult.data?.id ?? '',
            identityData
        )

        if (!identityCardResult.success) throw new Error(identityCardResult.error)

        const formattedUser = userResult.data ? await getUserByClerkId(userResult.data.clerkId) : null

        if (!formattedUser) {
            throw new Error('Error al obtener el usuario')
        }

        handleApiResult(userResult, 'Registro completado, vamos a validar tu identidad.')
        return formattedUser
    }

    // const handleTravelerFlow = async (stepId: string, data: any) => {
    //     setIsLoading(true)
    //     try {
    //         if (stepId === 'personalInfo') {
    //             moveToNextStep()
    //         } else if (stepId === 'identityCard') {
    //             await (data === null ?
    //                 createTravelerWithoutDocument() :
    //                 createTravelerWithDocument(data)
    //             )
    //             router.push('/')
    //         }
    //     } catch (error) {
    //         handleApiError()
    //     } finally {
    //         setIsLoading(false)
    //     }
    // }

    const handleTravelerFlow = async (stepId: string, data: any) => {
        setIsLoading(true)
        try {
            if (stepId === 'personalInfo') {
                moveToNextStep()
                return null
            } else if (stepId === 'identityCard') {
                const formattedUser = await (data === null ?
                    createTravelerWithoutDocument() :
                    createTravelerWithDocument(data)
                )
                if (formattedUser) {
                    router.push('/');
                    setUser(formattedUser);
                    return { success: true };
                }
                return {
                    success: false,
                };
            }
        } catch (error) {
            handleApiError()
            return { success: false, }
        } finally {
            setIsLoading(false)
        }
    }

    // Funciones de flujo del conductor
    const createDriverBaseProfile = async (personalInfo: any) => {
        const userResult = await createUser({
            ...personalInfo,
            role: 'driver'
        })

        if (!userResult.success) throw new Error(userResult.error)

        // Obtenemos el usuario formateado usando el clerkId que debería venir en userResult.data
        const formattedUser = userResult.data ? await getUserByClerkId(userResult.data.clerkId) : null

        if (!formattedUser) {
            throw new Error('Error al obtener el usuario formateado')
        }

        return formattedUser
    }

    // const uploadDriverDocuments = async (identityCard: any, driverLicense: any) => {
    //     const identityResult = await uploadIdentityCard(user!.id, identityCard)
    //     if (!identityResult.success) throw new Error(identityResult.error)

    //     const licenseResult = await uploadDriverLicense(user!.id, driverLicense)
    //     if (!licenseResult.success) throw new Error(licenseResult.error)
    // }

    // const uploadDriverDocuments = async (identityCard: any, driverLicense: any) => {
    //     try {
    //       const identityResult = await uploadIdentityCard(user!.id, identityCard);
    //       if (!identityResult.success) {
    //         return {
    //           success: false,
    //           error: 'Error al cargar el documento de identidad',
    //           details: identityResult.error,
    //           step: 'identityCard'
    //         };
    //       }

    //       const licenseResult = await uploadDriverLicense(user!.id, driverLicense);
    //       if (!licenseResult.success) {
    //         return {
    //           success: false,
    //           error: 'Error al cargar la licencia de conducir',
    //           details: licenseResult.error,
    //           step: 'driverLicense'
    //         };
    //       }

    //       return {
    //         success: true,
    //         data: {
    //           identityCard: identityResult.data,
    //           driverLicense: licenseResult.data
    //         }
    //       };
    //     } catch (error) {
    //       console.error('Error en uploadDriverDocuments:', error);
    //       return {
    //         success: false,
    //         error: 'Error inesperado al cargar los documentos',
    //         details: error instanceof Error ? error.message : 'Error desconocido',
    //         step: 'unknown'
    //       };
    //     }
    //   };

    const uploadDriverDocuments = async (identityCard?: any, driverLicense?: any) => {
        try {
            if (identityCard) {
                const identityResult = await uploadIdentityCard(user!.id, identityCard);
                if (!identityResult.success) {
                    return {
                        success: false,
                        error: 'Error al cargar el documento de identidad',
                        details: identityResult.error,
                        step: 'identityCard'
                    };
                }
            }

            if (driverLicense) {
                const licenseResult = await uploadDriverLicense(user!.id, driverLicense);
                if (!licenseResult.success) {
                    return {
                        success: false,
                        error: 'Error al cargar la licencia de conducir',
                        details: licenseResult.error,
                        step: 'driverLicense'
                    };
                }
            }

            const formattedUser = await getUserByClerkId(user!.clerkId);
            if (!formattedUser) {
                throw new Error('Error al obtener el usuario formateado después de cargar los documentos');
            }

            return {
                success: true,
                data: formattedUser
            };
        } catch (error) {
            console.error('Error en uploadDriverDocuments:', error);
            return {
                success: false,
                error: 'Error inesperado al cargar los documentos',
                details: error instanceof Error ? error.message : 'Error desconocido',
                step: 'unknown'
            };
        }
    };

    // const finalizeDriverRegistration = async (carInfo: any, insurance: any) => {
    //     const result = await finalizeDriver(user!.id, {
    //         car: carInfo,
    //         insurance: insurance
    //     })

    //     if (!result.success) throw new Error(result.error)
    // }

    const completeRegistration = () => {
        try {
            ['identityCard', 'driverLicense', 'carInfo', 'insurance']
                .forEach(step => localStorage.removeItem(`driver_registration_${step}`))

            toast.success('¡Registro completado!', {
                description: 'Vamos a estar verificando la informacion que nos proporcionaste.'
            })

            router.push('/')
        } catch (error) {
            console.error('Error completing registration:', error)
            toast.error('Error al finalizar el registro', {
                description: 'Por favor, intenta nuevamente.'
            })
        }
    }

    const handleDriverFlow = async (stepId: string, data: any) => {
        setIsLoading(true)
        try {
            switch (stepId) {
                case 'personalInfo':
                    const userProfile = await createDriverBaseProfile(data)
                    setUserProfile(userProfile)
                    moveToNextStep()
                    break;
                case 'identityCard':
                    saveStepData(data)
                    moveToNextStep()
                    break;
                case 'driverLicense':
                    // Preparar los datos de identityCard
                    let identityCardData = null;
                    let driverLicenseData = null;

                    // Solo procesar identityCard si existe y tiene la estructura necesaria
                    if (formData.identityCard &&
                        formData.identityCard.frontImage &&
                        formData.identityCard.backImage) {
                        identityCardData = {
                            ...formData.identityCard,
                            frontImage: {
                                ...formData.identityCard.frontImage,
                                preview: formData.identityCard.frontImage.preview
                            },
                            backImage: {
                                ...formData.identityCard.backImage,
                                preview: formData.identityCard.backImage.preview
                            }
                        };
                    }

                    // Solo procesar driverLicense si existe y tiene la estructura necesaria
                    if (data && data.frontImage && data.backImage) {
                        driverLicenseData = {
                            ...data,
                            frontImage: {
                                ...data.frontImage,
                                preview: data.frontImage.preview
                            },
                            backImage: {
                                ...data.backImage,
                                preview: data.backImage.preview
                            }
                        };
                    }

                    console.log('identityCardData:', identityCardData);
                    console.log('driverLicenseData:', driverLicenseData);

                    const uploadResult = await uploadDriverDocuments(
                        identityCardData,
                        driverLicenseData
                    );

                    if (!uploadResult.success) {
                        toast.error(`Error: ${uploadResult.error}`, {
                            description: uploadResult.details
                        });
                        if (uploadResult.step === 'identityCard') {
                            setCurrentStepId('identityCard');
                        }
                        return { success: false };
                    } else {
                        setUser(uploadResult.data!);
                        completeRegistration();
                        return { success: true };
                    }
                    break;
                // case 'carInfo':
                //     saveStepData(data)
                //     moveToNextStep()
                //     break;
                // case 'insurance':
                //     await finalizeDriverRegistration(formData.carInfo, data)
                //     completeRegistration()
                //     break;
            }
        } catch (error) {
            console.log('Error en handleDriverFlow:', error)
            handleApiError()
        } finally {
            setIsLoading(false)
        }
    }

    // Handlers principales
    const handleRoleSelection = useCallback((role: UserRole) => {
        // Si hay un initialRole, lo usamos; de lo contrario, usamos el role proporcionado
        const selectedRole = initialRole || role;
        setFormData(prev => ({ ...prev, role: selectedRole }));

        // Check if we need to show any other steps
        const needsPersonalInfo = !user?.termsAccepted;
        const needsIdentity = user?.identityStatus === null || user?.identityStatus === VerificationStatus.FAILED;
        const needsLicense = selectedRole === 'driver' &&
            (user?.licenseStatus === null || user?.licenseStatus === VerificationStatus.FAILED);

        if (!needsPersonalInfo && !needsIdentity && !needsLicense) {
            completeRegistration();
        } else {
            // Find the first required step
            let nextStep = needsPersonalInfo ? 'personalInfo' :
                needsIdentity ? 'identityCard' :
                    needsLicense ? 'driverLicense' : null;

            if (nextStep) {
                setCurrentStepId(nextStep);
            } else {
                completeRegistration();
            }
        }

        // Si hay un initialRole, saltamos directamente al siguiente paso
        if (initialRole) {
            const nextStep = needsPersonalInfo ? 'personalInfo' :
                needsIdentity ? 'identityCard' :
                    needsLicense ? 'driverLicense' : null;

            if (nextStep) {
                setCurrentStepId(nextStep);
            } else {
                completeRegistration();
            }
        }
    }, [user, completeRegistration, initialRole]);

    const handleNext = useCallback(async (data: any) => {
        if (currentStep.id === 'role') {
            handleRoleSelection(data)
            return
        }

        setFormData(prev => ({ ...prev, [currentStep.id]: data }))

        if (formData.role === 'traveler') {
            await handleTravelerFlow(currentStep.id, data)
        } else {
            await handleDriverFlow(currentStep.id, data)
        }
    }, [currentStep, formData.role])

    const handleBack = useCallback(() => {
        if (currentStepIndex > 0) {
            const prevStepId = steps[currentStepIndex - 1]?.id
            if (prevStepId) setCurrentStepId(prevStepId)
        } else if (formData.role) {
            setFormData(prev => ({ ...prev, role: null }))
            setCurrentStepId('role')
        }
    }, [currentStepIndex, steps, formData.role])

    return {
        currentStep,
        currentStepIndex,
        steps,
        totalSteps,
        formData,
        isLoading,
        handleNext,
        handleBack,
        handleSkip: () => handleNext(null),
        setFormData,
        userProfile,
        setUser,
        setIsLoading,
        user,
    }
}