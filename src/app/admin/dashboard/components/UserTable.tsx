'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { UserDetailsModal } from './UserDetailsModal'
import { useApiResponse } from '@/hooks/ui/useApiResponse'
import { FormattedUserForAdminDashboard, UserCar } from '@/types/user-types'
import { getUserDocuments } from '@/actions'
import { DocumentResponse } from '@/services/registration/admin/user-service'

interface UserTableProps {
  users: FormattedUserForAdminDashboard[]
}

export function UserTable({ users }: UserTableProps) {
  const [selectedUser, setSelectedUser] = useState<FormattedUserForAdminDashboard & { documents?: DocumentResponse } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { handleResponse } = useApiResponse()

  const handleViewDetails = async (user: FormattedUserForAdminDashboard) => {
    setIsLoading(true)
    setSelectedUser(user)
    try {
      const response = await getUserDocuments(user.id)
      if (response.success) {
        setSelectedUser({ ...user, documents: response.data })
      }
    } catch (error) {
      handleResponse({ success: false, message: 'Error al obtener los documentos del usuario' })
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString()
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre Completo</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Fecha de Creación</TableHead>
            <TableHead>Estado de Identidad</TableHead>
            <TableHead>Estado de Licencia</TableHead>
            <TableHead>Estado de Vehiculo</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.fullName}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phone}</TableCell>
              <TableCell>{formatDate(user.createdAt)}</TableCell>
              <TableCell>
                <Badge variant={getBadgeVariant(user.identityStatus)}>{user.identityStatus}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getBadgeVariant(user.licenseStatus)}>{user.licenseStatus}</Badge>
              </TableCell>
              <TableCell>
                {user.cars?.some((car: UserCar) => car.insurance.status === 'PENDING') ?
                  <Badge variant={getBadgeVariant('PENDING')}>PENDIENTE</Badge> :
                  user.cars?.some((car: UserCar) => car.insurance.status === 'FAILED') ?
                    <Badge variant={getBadgeVariant('FAILED')}>FALLIDO</Badge> :
                    null
                }
              </TableCell>
              <TableCell>
                <Button onClick={() => handleViewDetails(user)} disabled={isLoading}>
                  {isLoading ? 'Cargando...' : 'Ver detalles'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          isLoading={isLoading}
        />
      )}
    </>
  )
}

function getBadgeVariant(status: string | null) {
  switch (status) {
    case 'PENDING':
      return 'warning'
    case 'VERIFIED':
      return 'success'
    case 'FAILED':
      return 'destructive'
    default:
      return 'secondary'
  }
}

