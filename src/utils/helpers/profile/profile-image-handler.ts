import { ProfileService } from "@/services/profile/profile-service"
import { FormattedUser } from "@/types/user-types"
import { ApiResponse } from "@/types/api-types"
import { toast } from "sonner"
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/config/constants"


interface ValidationResult {
    isValid: boolean;
    error?: string;
  }
  
  const validateImageFile = (file: File): ValidationResult => {
    // Check if file exists
    if (!file) {
      return { 
        isValid: false, 
        error: "No se seleccionó ningún archivo" 
      };
    }
  
    // Check file type
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return { 
        isValid: false, 
        error: "Solo se aceptan imágenes JPG y PNG" 
      };
    }
  
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return { 
        isValid: false, 
        error: "La imagen no debe superar los 3MB" 
      };
    }
  
    return { isValid: true };
  };

interface HandleProfileImageUploadParams {
    event: React.ChangeEvent<HTMLInputElement>
    userId: string
    user: FormattedUser
    setIsUploadingImage: (isUploading: boolean) => void
    setUser: (user: FormattedUser) => void
    handleResponse: <T>(response: ApiResponse<T>) => void
}

export const handleProfileImageUpload = async ({ 
    event, 
    userId,
    user, 
    setIsUploadingImage, 
    setUser, 
    handleResponse 
  }: HandleProfileImageUploadParams) => {
    const file = event.target.files?.[0];
    
    // Reset input value early
    event.target.value = '';
  
    if (!file || !user) {
      toast.error("Error", { 
        description: "No se seleccionó ningún archivo o usuario no encontrado" 
      });
      return;
    }
  
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast.error("Error de validación", { 
        description: validation.error 
      });
      return;
    }
  
    try {
      setIsUploadingImage(true);
      const profileService = new ProfileService();
      const result = await profileService.updateProfileImage(file, userId);
  
      if (result.success) {
        setUser({ ...user, profileImageKey: result.data?.key ?? null });
        handleResponse({
          success: true,
          message: result.data?.message
        });
      } else {
        handleResponse({
          success: false,
          message: result.data?.message || "Error al actualizar la imagen de perfil"
        });
      }
    } catch (error) {
      handleResponse({ 
        success: false, 
        message: error instanceof Error ? error.message : "Error desconocido" 
      });
    } finally {
      setIsUploadingImage(false);
    }
  };