import NextLink from 'next/link' // Aliased to NextLink to avoid conflict with lucide-react's Link icon

import { Camera, Loader2, Link as LinkIcon } from 'lucide-react' // Using Link from lucide-react as LinkIcon

import { ExpandableAvatar } from "@/components/avatar-modal/AvatarModal" // Assuming this component exists
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { FormattedUser } from "@/types/user-types" // Assuming this type is correctly defined elsewhere


interface ProfileImageUploadButtonProps {
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading?: boolean;
}

export function ProfileImageUploadButton({ onUpload, isUploading }: ProfileImageUploadButtonProps) {
  return (
    <label htmlFor="profile-image-upload" className="absolute bottom-0 right-0 bg-background p-1 rounded-full cursor-pointer shadow-md hover:bg-muted">
      {isUploading ? (
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      ) : (
        <Camera className="h-5 w-5 text-primary" />
      )}
      <input id="profile-image-upload" type="file" className="hidden" onChange={onUpload} accept="image/*" />
    </label>
  )
}

interface ProfileCardProps {
  firstName: string;
  lastName: string;
  email: string;
  user: FormattedUser;
  completion: number;
  isUploadingImage?: boolean;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  userId: string;
}

export function ProfileCard({
  user,
  firstName,
  lastName,
  email,
  completion,
  isUploadingImage,
  onImageUpload,
  userId
}: ProfileCardProps) {
  const getVerificationStatus = () => {
    switch (user.identityStatus) {
      case 'VERIFIED': return { text: 'Verificado', color: 'text-green-500' };
      case 'PENDING': return { text: 'Pendiente de verificación', color: 'text-blue-500' };
      case 'FAILED': return { text: 'Verificación fallida', color: 'text-red-500' };
      default: return { text: 'No verificado', color: 'text-yellow-500' };
    }
  }
  const status = getVerificationStatus();

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <ExpandableAvatar
              imageUrl={user.profileImageKey ?? undefined}
              firstName={firstName}
              lastName={lastName}
            />
            {user.identityStatus === 'VERIFIED' && !user.profileImageKey && completion < 100 && (
              <ProfileImageUploadButton onUpload={onImageUpload} isUploading={isUploadingImage} />
            )}
          </div>
          <div>
            <CardTitle className="text-2xl">Bienvenido, {firstName}!</CardTitle>
            <CardDescription>{email}</CardDescription>
            <p className={`text-sm font-medium ${status.color}`}>Estado: {status.text}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div>
          <div className="flex justify-between items-center mb-1">
            <p className="text-sm font-medium text-muted-foreground">Perfil {completion < 100 ? 'incompleto' : 'completo'}</p>
            <p className="text-sm font-semibold">{completion}%</p>
          </div>
          <Progress value={completion} aria-label={`${completion}% de completitud del perfil`} />
          {completion < 100 && (
            <p className="mt-1 text-xs text-muted-foreground">
              {user.identityStatus !== 'VERIFIED'
                ? "Complete la verificación de identidad para mejorar su perfil."
                : !user.profileImageKey
                  ? "Añada una foto de perfil para completar su perfil al 100%."
                  : "Complete los pasos restantes para finalizar su perfil."}
            </p>
          )}
        </div>

        {/* Public Profile Link Section - Updated for subtlety */}
        <div className="flex justify-end pt-1">
          <NextLink href={`/perfil/${userId}`} passHref legacyBehavior>
            <Button
              variant="link"
              className="text-xs sm:text-sm text-muted-foreground hover:text-primary p-0 h-auto" // Removed default padding and height
            >
              Ver perfil público
              <LinkIcon className="ml-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5" /> {/* Icon after text, slightly smaller */}
            </Button>
          </NextLink>
        </div>
      </CardContent>
    </Card>
  );
}

