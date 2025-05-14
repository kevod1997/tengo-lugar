import { CheckCircle, AlertCircle, Clock, HelpCircle } from 'lucide-react'
import { cn } from "@/lib/utils"

interface Step {
  title: string
  status: 'completed' | 'pending' | 'failed' | 'not-started' | string
  description: string
}

interface DriverRegistrationStatusProps {
  steps: Step[]
}

export function DriverRegistrationStatus({ steps }: DriverRegistrationStatusProps) {
  const getStepIcon = (status: Step['status']) => {
    switch (status) {
      case 'completed':
      case 'VERIFIED':
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case 'pending':
      case 'PENDING':
        return <Clock className="h-6 w-6 text-blue-500 animate-pulse" />
      case 'failed':
      case 'FAILED':
        return <AlertCircle className="h-6 w-6 text-red-500" />
      case 'not-started':
      default:
        return <HelpCircle className="h-6 w-6 text-gray-400" />
    }
  }

  return (
    <div className="space-y-4">
      {steps.map((step) => (
        <div key={step.title} className="flex items-start space-x-4">
          <div className="flex-shrink-0">{getStepIcon(step.status)}</div>
          <div className="flex-grow">
            <h3 className="text-lg font-semibold">{step.title}</h3>
            <p className={cn(
              "text-sm",
              (step.status === 'completed' || step.status === 'VERIFIED') && "text-green-600",
              (step.status === 'pending' || step.status === 'PENDING') && "text-blue-600",
              (step.status === 'failed' || step.status === 'FAILED') && "text-red-600",
              (step.status === 'not-started' || !['completed', 'VERIFIED', 'pending', 'PENDING', 'failed', 'FAILED'].includes(step.status)) && "text-gray-600"
            )}>
              {step.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

