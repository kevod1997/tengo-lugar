

import { CalendarDays, Users, Car, DollarSign, Leaf, Star } from 'lucide-react'


import Header from '@/components/header/header'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { AdminMetricCard } from './components/AdminMetricCard'
import { AdminNav } from './components/AdminNav'

import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'


export const metadata: Metadata = {
  title: 'Admin Dashboard | Tengo Lugar',
  description: 'Panel de administración principal de Tengo Lugar',
}

export default function AdminDashboardPage() {
  // Aquí iría la lógica para obtener las métricas reales de la base de datos
  const metrics = {
    totalTrips: 1250,
    totalUsers: 5000,
    averageOccupancy: 3.2,
    totalRevenue: 15000,
    newUsers: 300,
    averageRating: 4.7,
    completedTrips: 950,
    co2Saved: 5000
  }

  const breadcrumbs = [
    { label: 'Inicio', href: '/' },
    { label: 'Admin' },
  ]

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <Header breadcrumbs={breadcrumbs} />
      <AdminNav />
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="analytics">Analíticas</TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <AdminMetricCard title="Viajes Activos" value={metrics.totalTrips} icon={Car} />
            <AdminMetricCard title="Usuarios Totales" value={metrics.totalUsers} icon={Users} />
            <AdminMetricCard title="Ocupación Promedio" value={`${metrics.averageOccupancy} pasajeros`} icon={Users} />
            <AdminMetricCard title="Ingresos Totales" value={`$${metrics.totalRevenue}`} icon={DollarSign} />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <AdminMetricCard title="Nuevos Usuarios (30 días)" value={metrics.newUsers} icon={Users} />
            <AdminMetricCard title="Calificación Promedio" value={metrics.averageRating} icon={Star} />
            <AdminMetricCard title="Viajes Completados (Mes)" value={metrics.completedTrips} icon={CalendarDays} />
            <AdminMetricCard title="CO2 Ahorrado (kg)" value={metrics.co2Saved} icon={Leaf} />
          </div>

        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analíticas Detalladas</CardTitle>
            </CardHeader>
            <CardContent>
              Aquí irían gráficos y estadísticas más detalladas.
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reportes del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              Aquí iría una lista de reportes generados o la opción de generar nuevos reportes.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

