import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera } from 'lucide-react'
import { FormattedUser } from "@/types/user-types"

interface ProfileCardProps {
  user: FormattedUser
  calculateProfileCompletion: () => number
  handleProfileImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export function ProfileCard({ user, calculateProfileCompletion, handleProfileImageUpload }: ProfileCardProps) {
  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user?.profileImageKey ?? undefined} alt={user?.firstName || ""} />
              <AvatarFallback className="bg-slate-500 text-white text-xl">
                {user?.firstName?.charAt(0)}
                {user?.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <label htmlFor="profile-image-upload" className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer">
              <input
                id="profile-image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfileImageUpload}
                disabled={true}
              />
              <Camera className="h-4 w-4" />
            </label>
          </div>
          <div>
            <CardTitle className="text-2xl md:text-3xl">Bienvenido, {user.firstName}!</CardTitle>
            <CardDescription>{user.email}</CardDescription>
            <div className="mt-2">
              <span className="text-sm font-medium mr-2">Estado:</span>
              <span className={`text-sm font-medium ${user.identityStatus === 'VERIFIED' ? 'text-green-500' :
                user.identityStatus === 'PENDING' ? 'text-blue-500' :
                  user.identityStatus === 'FAILED' ? 'text-red-500' :
                    'text-yellow-500'
                }`}>
                {user.identityStatus === 'VERIFIED' ? 'Verificado' :
                  user.identityStatus === 'PENDING' ? 'Pendiente de verificación' :
                    user.identityStatus === 'FAILED' ? 'Verificación fallida' :
                      'No verificado'}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mt-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Perfil {`${calculateProfileCompletion() < 100 ? 'incompleto' : 'completo'}`}</span>
            <span className="text-sm font-medium">{calculateProfileCompletion()}%</span>
          </div>
          <Progress value={calculateProfileCompletion()} className="w-full" />
          {calculateProfileCompletion() < 100 && (
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

