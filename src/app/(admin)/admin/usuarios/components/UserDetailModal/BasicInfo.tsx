import type { FormattedUserForAdminDashboard } from "@/types/user-types"

interface BasicInfoProps {
  user: FormattedUserForAdminDashboard
}

export function BasicInfo({ user }: BasicInfoProps) {
  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Información Básica</h2>
      <div>
        <h3 className="font-semibold">Nombre completo</h3>
        <p>{user.fullName}</p>
      </div>
      <div>
        <h3 className="font-semibold">Email</h3>
        <p>{user.email}</p>
      </div>
      <div>
        <h3 className="font-semibold">Teléfono</h3>
        <p>{user.phoneNumber}</p>
      </div>
      <div>
        <h3 className="font-semibold">Fecha de creación</h3>
        <p>{formatDate(user.createdAt)}</p>
      </div>
    </div>
  )
}

