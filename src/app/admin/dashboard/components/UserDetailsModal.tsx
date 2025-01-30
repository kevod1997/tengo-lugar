"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { FormattedUserForAdminDashboard } from "@/types/user-types"
import type { DocumentResponse } from "@/services/registration/admin/user-service"
import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"
import { useApiResponse } from "@/hooks/ui/useApiResponse"
import { CheckCircle, Clock, XCircle } from "lucide-react"
import { validateDocument } from "@/actions/register/admin/validate-document"
import { BasicInfo } from "./UserDetailModal/BasicInfo"
import { IdentityTab } from "./UserDetailModal/IdentityTab"
import { LicenseTab } from "./UserDetailModal/LicenseTab"
import { VehicleTab } from "./UserDetailModal/VehicleTab"

interface UserDetailsModalProps {
  user: FormattedUserForAdminDashboard & { documents?: DocumentResponse }
  onClose: () => void
  isLoading: boolean
}

export function UserDetailsModal({ user, onClose, isLoading }: UserDetailsModalProps) {
  const { handleResponse } = useApiResponse()
  const [validating, setValidating] = useState(false)

  const handleValidation = async (validationRequest: any) => {
    console.log(validationRequest, user.email)
    try {
      setValidating(true)

      const result = await validateDocument(validationRequest, user.email)
      handleResponse({ success: result.success, message: result.message })
      if (result.success) {
        onClose()
      }
    } catch (error) {
      handleResponse({ success: false, message: (error as Error).message })
    } finally {
      setValidating(false)
    }
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
                  {user.documents?.identityCard?.status === "PENDING" && (
                    <Clock className="ml-2 h-4 w-4 text-yellow-500" />
                  )}
                  {user.documents?.identityCard?.status === "FAILED" && (
                    <XCircle className="ml-2 h-4 w-4 text-red-500" />
                  )}
                  {user.documents?.identityCard?.status === "VERIFIED" && (
                    <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="license" className="flex items-center justify-center">
                  Licencia
                  {user.documents?.licence?.status === "PENDING" && <Clock className="ml-2 h-4 w-4 text-yellow-500" />}
                  {user.documents?.licence?.status === "FAILED" && <XCircle className="ml-2 h-4 w-4 text-red-500" />}
                  {user.documents?.licence?.status === "VERIFIED" && (
                    <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="vehicle" className="flex items-center justify-center">
                  Vehículo
                  {user.documents?.cars?.some((car) => car.insurance.status === "PENDING") && (
                    <Clock className="ml-2 h-4 w-4 text-yellow-500" />
                  )}
                  {user.documents?.cars?.some((car) => car.insurance.status === "FAILED") && (
                    <XCircle className="ml-2 h-4 w-4 text-red-500" />
                  )}
                  {user.documents?.cars?.every((car) => car.insurance.status === "VERIFIED") && (
                    <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
                  )}
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

