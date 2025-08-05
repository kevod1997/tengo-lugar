'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { UserDetailsModal } from './UserDetailsModal'
import { useApiResponse } from '@/hooks/ui/useApiResponse'
import { FormattedUserForAdminDashboard } from '@/types/user-types'
import { getUserDocuments } from '@/actions'
import { DocumentResponse } from '@/services/registration/admin/user-service'
import { Eye, FileText } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UserLogsView } from './UserLogs/UserLogsDetail'
import { getVehicleStatus } from '@/utils/helpers/driver/get-vehicle-status'

interface UserTableProps {
  users: FormattedUserForAdminDashboard[]
}

export function UserTable({ users }: UserTableProps) {
  const [selectedUser, setSelectedUser] = useState<FormattedUserForAdminDashboard & { documents?: DocumentResponse } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showLogs, setShowLogs] = useState(false)
  const [selectedUserForLogs, setSelectedUserForLogs] = useState<string | null>(null)
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
      console.warn(error)
      handleResponse({ success: false, message: 'Error al obtener los documentos del usuario' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewLogs = (userId: string) => {
    setSelectedUserForLogs(userId)
    setShowLogs(true)
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
            <TableHead></TableHead>
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
              <TableCell>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.profileImageUrl || "/placeholder.svg"} alt={user.fullName} />
                  <AvatarFallback>{user.profileImageUrl}</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell>{user.fullName}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phoneNumber}</TableCell>
              <TableCell>{formatDate(user.createdAt)}</TableCell>
              <TableCell>
                <Badge variant={getBadgeVariant(user.identityStatus)}>{user.identityStatus}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getBadgeVariant(user.licenseStatus)}>{user.licenseStatus}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getBadgeVariant(getVehicleStatus(user.cars))}>
                  {getVehicleStatus(user.cars) || 'SIN VEHÍCULO'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleViewDetails(user)}
                    disabled={isLoading}
                    title="Ver detalles"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleViewLogs(user.id)}
                    title="Ver historial"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
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
      <Dialog open={showLogs} onOpenChange={setShowLogs}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Historial de Actividad - {users.find(u => u.id === selectedUserForLogs)?.fullName}
            </DialogTitle>
          </DialogHeader>
          {selectedUserForLogs && <UserLogsView userId={selectedUserForLogs} />}
        </DialogContent>
      </Dialog>
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

