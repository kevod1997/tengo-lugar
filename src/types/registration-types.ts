import CarCardForm from "@/app/(authenticated)/perfil/components/ui/registration/steps/car-card-form";
import CarForm from "@/app/(authenticated)/perfil/components/ui/registration/steps/car-form";
import DriverLicenseForm from "@/app/(authenticated)/perfil/components/ui/registration/steps/driver-license-form";
import IdentityCardForm from "@/app/(authenticated)/perfil/components/ui/registration/steps/identity-card-form";
import InsuranceForm from "@/app/(authenticated)/perfil/components/ui/registration/steps/insurance-form";
import PersonalInfoForm from "@/app/(authenticated)/perfil/components/ui/registration/steps/personal-info-form";
import RoleSelection from "@/app/(authenticated)/perfil/components/ui/registration/steps/role-selection";

export interface Step {
  id: string;
  title: string;
  component: React.ComponentType<any>;
}

export type StepId = 'role' | 'personalInfo' | 'identityCard' | 'driverLicense' | 'carInfo' | 'insurance' | "carCard";
export type UserRole = 'traveler' | 'driver' ;

export interface FormData {
  role: UserRole | null;
  personalInfo: any;
  identityCard: any;
  driverLicense: any;
  carInfo: any;
  insurance: any;
  carCard: any
}

export const allSteps: Record<string, Step> = {
  // Bloque 1: Registro Base
  role: { id: 'role', title: 'Rol', component: RoleSelection },
  personalInfo: { id: 'personalInfo', title: 'Información Personal', component: PersonalInfoForm },

  // Bloque 2: Documentos

  identityCard: { id: 'identityCard', title: 'Documento de Identidad', component: IdentityCardForm },
  driverLicense: { id: 'driverLicense', title: 'Licencia de Conducir', component: DriverLicenseForm },

  // Bloque 3: Vehículo
  carInfo: { id: 'carInfo', title: 'Información del Vehículo', component: CarForm },
  insurance: { id: 'insurance', title: 'Seguro del Vehículo', component: InsuranceForm },
  carCard: { id: 'carCard', title: 'Cedula', component: CarCardForm },
};

export const travelerStepIds = ['role', 'personalInfo', 'identityCard'];
export const driverStepIds = ['role', 'personalInfo', 'identityCard', 'driverLicense', 'carInfo', 'insurance', 'carCard'];
