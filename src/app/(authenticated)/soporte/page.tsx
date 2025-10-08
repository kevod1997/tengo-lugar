import Header from '@/components/header/header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreateTicketForm } from './components/CreateTicketForm'
import { TicketList } from './components/TicketList'
import { MessageCircle, TicketIcon } from 'lucide-react'

export const metadata = {
  title: 'Centro de Soporte | Tengo Lugar',
  description: 'Crea y gestiona tus tickets de soporte',
}

export default function SoportePage() {
  return (
    <>
      <Header
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Soporte' },
        ]}
        showBackButton={true}
      />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Centro de Soporte</h1>
            <p className="text-muted-foreground">
              Crea un ticket de soporte o revisa el estado de tus solicitudes anteriores
            </p>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create" className="gap-2">
                <MessageCircle className="w-4 h-4" />
                Crear Ticket
              </TabsTrigger>
              <TabsTrigger value="my-tickets" className="gap-2">
                <TicketIcon className="w-4 h-4" />
                Mis Tickets
              </TabsTrigger>
            </TabsList>

            {/* Create Ticket Tab */}
            <TabsContent value="create">
              <Card>
                <CardHeader>
                  <CardTitle>Crear nuevo ticket</CardTitle>
                  <CardDescription>
                    Describe tu problema y nuestro equipo te ayudará lo antes posible.
                    Asegúrate de incluir todos los detalles relevantes.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CreateTicketForm />
                </CardContent>
              </Card>

              {/* Help Information */}
              <Card className="mt-6 bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-base">Antes de crear un ticket</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex gap-2">
                    <span className="font-semibold text-foreground shrink-0">1.</span>
                    <p>
                      <strong className="text-foreground">Verifica tu teléfono:</strong> Necesitas
                      tener tu número de teléfono verificado para crear tickets.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold text-foreground shrink-0">2.</span>
                    <p>
                      <strong className="text-foreground">Sé específico:</strong> Incluye números
                      de viaje, fechas, capturas de pantalla o cualquier detalle que ayude a
                      resolver tu problema más rápido.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-semibold text-foreground shrink-0">3.</span>
                    <p>
                      <strong className="text-foreground">Tiempo de respuesta:</strong> Nuestro
                      equipo responde en un plazo de 24-48 horas hábiles.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* My Tickets Tab */}
            <TabsContent value="my-tickets">
              <Card>
                <CardHeader>
                  <CardTitle>Mis tickets de soporte</CardTitle>
                  <CardDescription>
                    Historial completo de tus solicitudes de soporte
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TicketList />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  )
}
