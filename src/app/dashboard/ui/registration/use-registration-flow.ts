import { useState, useCallback, useMemo, useEffect } from 'react'
import { toast } from "sonner"
import { createUser } from '@/actions/user'
import { Step, UserRole, FormData } from './registration-types'
import PersonalInfoForm from './personal-info-form'
import IdentityCardForm from './identity-card-form'
import { RoleSelection } from './role-selection'
import { useRouter } from 'next/navigation'
import { uploadIdentityCard } from '@/actions/identity-card'
import { useUserStore } from '@/store/user-store'

const allSteps: Record<string, Step> = {
    role: { id: 'role', title: 'Rol', component: RoleSelection },
    personalInfo: { id: 'personalInfo', title: 'Información Personal', component: PersonalInfoForm },
    identityCard: { id: 'identityCard', title: 'Documento de Identidad', component: IdentityCardForm },
    driverLicense: { id: 'driverLicense', title: 'Licencia de Conducir', component: IdentityCardForm },
}

const travelerStepIds = ['role', 'personalInfo', 'identityCard']
const driverStepIds = ['role', 'personalInfo', 'identityCard', 'driverLicense']

export function useRegistrationFlow(initialStep: string, onComplete: (user: any) => void) {
    const router = useRouter()
    const { user } = useUserStore()
    const [currentStepId, setCurrentStepId] = useState(initialStep)
    const [formData, setFormData] = useState<FormData>(() => ({
        role: initialStep === 'identityCard' ? 'traveler' : null,
        personalInfo: null,
        identityCard: null,
        driverLicense: null,
    }))
    const [isLoading, setIsLoading] = useState(false)

    const steps = useMemo(() => {
        if (initialStep === 'identityCard') {
            return [allSteps.identityCard]
        }
        if (!formData.role || currentStepId === 'role') {
            return [allSteps.role]
        }
        const stepIds = formData.role === 'driver' ? driverStepIds : travelerStepIds
        return stepIds.map(id => allSteps[id])
    }, [formData.role, currentStepId, initialStep])

    const currentStepIndex = useMemo(() => {
        return steps.findIndex(step => step.id === currentStepId)
    }, [steps, currentStepId])

    const currentStep = useMemo(() => {
        return steps.find(step => step.id === currentStepId) || steps[0]
    }, [steps, currentStepId])

    const totalSteps = useMemo(() => {
        if (initialStep === 'identityCard') return 1
        return formData.role === 'driver' ? driverStepIds.length : travelerStepIds.length
    }, [formData.role, initialStep])

    const handleNext = useCallback(async (data: any) => {
        console.log('handleNext', { data, currentStep, currentStepIndex, steps })
        if (currentStep.id === 'role') {
            setFormData(prev => ({ ...prev, role: data as UserRole }))
            setCurrentStepId('personalInfo')
        } else {
            setFormData(prev => ({ ...prev, [currentStep.id]: data }))

            if (currentStep.id === 'identityCard') {
                await handleIdentityCardStep(data)
            } else if (currentStepIndex === steps.length - 1) {
                await handleFinalStep()
            } else {
                const nextStepId = steps[currentStepIndex + 1]?.id
                if (nextStepId) {
                    setCurrentStepId(nextStepId)
                }
            }
        }
    }, [currentStep, currentStepIndex, steps])

    const handleBack = useCallback(() => {
        console.log('handleBack', { currentStepIndex, steps, formData })
        if (currentStepIndex > 0) {
            const prevStepId = steps[currentStepIndex - 1]?.id
            if (prevStepId) {
                setCurrentStepId(prevStepId)
            }
        } else if (formData.role) {
            setFormData(prev => ({ ...prev, role: null }))
            setCurrentStepId('role')
        }
    }, [currentStepIndex, steps, formData.role])

    // const handleIdentityCardStep = async (data: any) => {
    //     console.log('handleIdentityCardStep', { data, formData })
    //     if (data === null) {
    //         // Skip action
    //         if (formData.role === 'driver') {
    //             const nextStepId = steps[currentStepIndex + 1]?.id
    //             if (nextStepId) {
    //                 setCurrentStepId(nextStepId)
    //             }
    //         } else {
    //             await createUserWithoutIdentityCard()
    //         }
    //     } else {
    //         // Verification submission
    //         await submitIdentityCardVerification(data)
    //         if (formData.role === 'driver') {
    //             const nextStepId = steps[currentStepIndex + 1]?.id
    //             if (nextStepId) {
    //                 setCurrentStepId(nextStepId)
    //             }
    //         } else {
    //             await handleFinalStep()
    //         }
    //     }
    // }

    const handleIdentityCardStep = async (data: any) => {
        console.log('handleIdentityCardStep', { data, formData })
        if (data === null) {
            // Skip action
            if (formData.role === 'driver') {
                const nextStepId = steps[currentStepIndex + 1]?.id
                if (nextStepId) {
                    setCurrentStepId(nextStepId)
                }
            } else {
                // Removido createUserWithoutIdentityCard ya que el usuario ya existe
                router.push('/')
            }
        } else {
            // Verification submission
            await submitIdentityCardVerification(data)
            if (formData.role === 'driver') {
                const nextStepId = steps[currentStepIndex + 1]?.id
                if (nextStepId) {
                    setCurrentStepId(nextStepId)
                }
            } else {
                // Removido handleFinalStep ya que no necesitamos crear el usuario
                // router.push('/')
            }
        }
    }

    const createUserWithoutIdentityCard = async () => {
        console.log('createUserWithoutIdentityCard', { formData })
        setIsLoading(true)
        try {
            const result = await createUser({ ...formData.personalInfo, role: formData.role })
            handleApiResult(result, 'Bienvenido a Tengo Lugar. Su cuenta ha sido creada.')
            router.push('/')
        } catch (error) {
            handleApiError()
        } finally {
            setIsLoading(false)
        }
    }

    const submitIdentityCardVerification = async (data: any) => {

        console.log('submitIdentityCardVerification', { data, formData })
        setIsLoading(true)
        try {
            const identityCardResult = await uploadIdentityCard(user!.id, {
                idNumber: data.idNumber,
                frontImage: {
                    file: data.frontImage,
                    source: 'camera',
                },
                backImage: {
                    file: data.backImage,
                    source: 'camera'
                },
                isVerificationRequired: true
            })

            if (!identityCardResult.success) {
                throw new Error(identityCardResult.error)
            }

            handleApiResult(identityCardResult, 'Su documento de identidad ha sido actualizado.')
            // Redirigir después de subir el documento
            // router.push('/')
        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Error al procesar los documentos de identidad'

            console.error('Error details:', error)
            toast.error('Error en el proceso', {
                description: errorMessage
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleFinalStep = async () => {
        console.log('handleFinalStep', { formData })
        setIsLoading(true)
        try {
            const userData = {
                ...formData.personalInfo,
                role: formData.role,
                identityCard: formData.identityCard,
                driverLicense: formData.driverLicense,
            }
            const result = await createUser(userData)
            handleApiResult(result, 'Bienvenido a Tengo Lugar. Su cuenta ha sido creada.')
        } catch (error) {
            handleApiError()
        } finally {
            setIsLoading(false)
        }
    }

    const handleApiResult = (result: any, successMessage: string) => {
        console.log('handleApiResult', { result, successMessage })
        if (result.success && result.data) {
            onComplete(result.data)
            toast.success('¡Proceso completado con éxito!', { description: successMessage })
        } else {
            toast.error('Error en el proceso', { description: result.error || 'Por favor, inténtalo de nuevo.' })
        }
    }

    const handleApiError = () => {
        toast.error('Error en el proceso', {
            description: 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.',
        })
    }

    console.log({
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
    })

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
    }
}