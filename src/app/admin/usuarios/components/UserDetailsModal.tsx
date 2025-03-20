"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { FormattedUserForAdminDashboard } from "@/types/user-types"
import type { DocumentResponse } from "@/services/registration/admin/user-service"
import { Skeleton } from "@/components/ui/skeleton"
import { useApiResponse } from "@/hooks/ui/useApiResponse"
import { validateDocument } from "@/actions/register/admin/validate-document"
import { BasicInfo } from "./UserDetailModal/BasicInfo"
import { IdentityTab } from "./UserDetailModal/IdentityTab"
import { LicenseTab } from "./UserDetailModal/LicenseTab"
import { VehicleTab } from "./UserDetailModal/VehicleTab"
import { StatusIndicator } from "@/components/status-indicator/StatusIndicator"
import { getVehicleStatus } from "@/utils/helpers/driver/get-vehicle-status"

interface UserDetailsModalProps {
  user: FormattedUserForAdminDashboard & { documents?: DocumentResponse }
  onClose: () => void
  isLoading: boolean
}

export function UserDetailsModal({ user, onClose, isLoading }: UserDetailsModalProps) {
  const { handleResponse } = useApiResponse()
  // const [validating, setValidating] = useState(false)

  const handleValidation = async (validationRequest: any) => {
    try {
      // setValidating(true)

      const result = await validateDocument(validationRequest, user.email)
      handleResponse({ success: result.success, message: result.message })
      if (result.success) {
        onClose()
      }
    } catch (error) {
      handleResponse({ success: false, message: (error as Error).message })
    } 
    // finally {
    //   setValidating(false)
    // }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles del Usuario</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <BasicInfo user={user} />
          </div>
          <div className="md:col-span-2">
            <Tabs defaultValue="identity" className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 max-sm:mb-12">
                <TabsTrigger value="identity" className="flex items-center justify-center">
                  DNI
                  <StatusIndicator status={user.documents?.identityCard?.status} />
                </TabsTrigger>
                <TabsTrigger value="license" className="flex items-center justify-center">
                  Licencia
                  <StatusIndicator status={user.documents?.licence?.status} />
                </TabsTrigger>
                <TabsTrigger value="vehicle" disabled={!user.documents?.cars?.length} className="flex items-center justify-center">
                  Vehículo
                  <StatusIndicator status={getVehicleStatus(user.documents?.cars ?? [])} />
                </TabsTrigger>
              </TabsList>
              <TabsContent value="identity">
                {isLoading ? (
                  <LoadingSkeleton />
                ) : (
                  <IdentityTab identityCard={user.documents?.identityCard} onValidate={handleValidation} />
                )}
              </TabsContent>
              <TabsContent value="license">
                {isLoading ? (
                  <LoadingSkeleton />
                ) : (
                  <LicenseTab licence={user.documents?.licence} onValidate={handleValidation} />
                )}
              </TabsContent>
              <TabsContent value="vehicle">
                {isLoading ? (
                  <LoadingSkeleton />
                ) : (
                  <VehicleTab cars={user.documents?.cars ?? []} onValidate={handleValidation} />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    </div>
  )
}

