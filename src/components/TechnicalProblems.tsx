'use client'

import { useState } from "react"

import { useRouter } from "next/navigation"

import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  Mail, 
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"




interface TechnicalProblemsPageProps {
  reason?: string
  title?: string
  description?: string
  showRefresh?: boolean
  showGoHome?: boolean
  showContactSupport?: boolean
}

const problemTypes = {
  search_unavailable: {
    title: "Búsqueda temporalmente no disponible",
    description: "Estamos experimentando problemas con nuestro servicio de búsqueda de viajes. Nuestro equipo técnico está trabajando para solucionarlo.",
    badge: "Búsqueda"
  },
  maps_unavailable: {
    title: "Mapas temporalmente no disponibles", 
    description: "El servicio de mapas está experimentando dificultades. Puedes continuar usando la aplicación con funcionalidad limitada.",
    badge: "Mapas"
  },
  payment_unavailable: {
    title: "Pagos temporalmente no disponibles",
    description: "Estamos experimentando problemas con el procesamiento de pagos. Los viajes existentes no se ven afectados.",
    badge: "Pagos"
  },
  general: {
    title: "Problemas técnicos temporales",
    description: "Estamos experimentando dificultades técnicas. Por favor, intenta nuevamente en unos minutos.",
    badge: "General"
  }
}

export default function TechnicalProblemsPage({
  reason = "general",
  title,
  description,
  showRefresh = true,
  showGoHome = true,
  showContactSupport = true
}: TechnicalProblemsPageProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()
  
  const problemInfo = problemTypes[reason as keyof typeof problemTypes] || problemTypes.general
  
  const finalTitle = title || problemInfo.title
  const finalDescription = description || problemInfo.description

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Pequeña pausa para mejor UX
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  const handleGoHome = () => {
    router.push('/')
  }

  const handleContactSupport = () => {
    // Aquí puedes redirigir a tu sistema de soporte
    window.open('mailto:soporte@tengolugar.com?subject=Problema técnico', '_blank')
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
          
          <div className="space-y-2">
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
              {problemInfo.badge}
            </Badge>
            
            <h1 className="text-2xl font-semibold text-gray-900">
              {finalTitle}
            </h1>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Descripción principal */}
          <div className="text-center">
            <p className="text-gray-600 leading-relaxed">
              {finalDescription}
            </p>
          </div>

          <Separator />

          {/* Botones de acción */}
          <div className="space-y-3">
            {showRefresh && (
              <Button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="w-full"
                size="lg"
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Intentar nuevamente
                  </>
                )}
              </Button>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {showGoHome && (
                <Button 
                  variant="outline" 
                  onClick={handleGoHome}
                  className="w-full"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Ir al inicio
                </Button>
              )}

              {showContactSupport && (
                <Button 
                  variant="outline" 
                  onClick={handleContactSupport}
                  className="w-full"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Contactar soporte
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}