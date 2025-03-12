import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Camera, Loader2 } from 'lucide-react'
import { FormattedUser } from "@/types/user-types"
import { ExpandableAvatar } from "@/components/avatar-modal/AvatarModal"

interface ProfileImageUploadButtonProps {
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  isUploading?: boolean
}

export function ProfileImageUploadButton({ onUpload, isUploading }: ProfileImageUploadButtonProps) {
  
  return (
    <label
      htmlFor="profile-image-upload"
      className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer"
    >
      <input
        id="profile-image-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onUpload}
        disabled={isUploading}
      />
      {isUploading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Camera className="h-4 w-4" />
      )}
    </label>
  )
}

interface ProfileCardProps {
  user: FormattedUser
  completion: number
  isUploadingImage?: boolean
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export function ProfileCard({
  user,
  completion,
  isUploadingImage,
  onImageUpload
}: ProfileCardProps) {
  const getVerificationStatus = () => {
    switch (user.identityStatus) {
      case 'VERIFIED':
        return { text: 'Verificado', color: 'text-green-500' }
      case 'PENDING':
        return { text: 'Pendiente de verificación', color: 'text-blue-500' }
      case 'FAILED':
        return { text: 'Verificación fallida', color: 'text-red-500' }
      default:
        return { text: 'No verificado', color: 'text-yellow-500' }
    }
  }

  const status = getVerificationStatus()

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <div className="relative">
          <ExpandableAvatar
              imageUrl={user.profileImageKey ?? undefined}
              firstName={user.firstName}
              lastName={user.lastName}
            />
            <ProfileImageUploadButton
              onUpload={onImageUpload}
              isUploading={isUploadingImage}
            />
          </div>
          <div>
            <CardTitle className="text-2xl md:text-3xl">
              Bienvenido, {user.firstName}!
            </CardTitle>
            <CardDescription>{user.email}</CardDescription>
            <div className="mt-2">
              <span className="text-sm font-medium mr-2">Estado:</span>
              <span className={`text-sm font-medium ${status.color}`}>
                {status.text}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">
              Perfil {completion < 100 ? 'incompleto' : 'completo'}
            </span>
            <span className="text-sm font-medium">{completion}%</span>
          </div>
          <Progress value={completion} className="w-full" />
          {completion < 100 && (
            <p className="text-sm text-muted-foreground mt-2">
              {user.identityStatus !== 'VERIFIED'
                ? "Complete la verificación de identidad para mejorar su perfil."
                : "Añada una foto de perfil para completar su perfil al 100%."}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}