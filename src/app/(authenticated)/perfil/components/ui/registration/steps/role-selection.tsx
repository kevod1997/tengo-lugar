import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Car, User as UserIcon, ArrowRight } from 'lucide-react'

type UserRole = 'traveler' | 'driver'

interface RoleSelectionProps {
  onNext: (role: UserRole) => void
  data: any
}

export default function RoleSelection({ onNext, data }: RoleSelectionProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(data.role || 'traveler')

  const roles = [
    {
      id: 'traveler',
      title: 'Viajero',
      description: 'Busca y reserva viajes compartidos de manera fácil y segura.',
      icon: UserIcon,
      disabled: false
    },
    {
      id: 'driver',
      title: 'Conductor',
      description: 'Ofrece viajes y divide los gastos de tu viaje con otros pasajeros.',
      icon: Car,
      disabled: false
    }
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {roles.map((role) => (
          <Card
            key={role.id}
            className={`relative overflow-hidden transition-all ${selectedRole === role.id
              ? 'border-primary ring-2 ring-primary ring-offset-2'
              : role.disabled
                ? 'opacity-50'
                : 'hover:border-primary/50'
              }`}
          >
            <CardContent
              className="p-6 cursor-pointer"
              onClick={() => !role.disabled && setSelectedRole(role.id as UserRole)}
            >
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <role.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium leading-none">{role.title}</h3>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Button
        onClick={() => onNext(selectedRole)}
        className="w-full"
        size="lg"
      >
        Continuar como {selectedRole === 'traveler' ? 'Viajero' : 'Conductor'}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  )
}