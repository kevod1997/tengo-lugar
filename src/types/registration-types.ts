import CarForm from "@/app/dashboard/ui/registration/steps/car-form";
import DriverLicenseForm from "@/app/dashboard/ui/registration/steps/driver-license-form";
import IdentityCardForm from "@/app/dashboard/ui/registration/steps/identity-card-form";
import InsuranceForm from "@/app/dashboard/ui/registration/steps/insurance-form";
import PersonalInfoForm from "@/app/dashboard/ui/registration/steps/personal-info-form";
import RoleSelection from "@/app/dashboard/ui/registration/steps/role-selection";

export interface Step {
  id: string;
  title: string;
  component: React.ComponentType<any>;
}

export type StepId = 'role' | 'personalInfo' | 'identityCard' | 'driverLicense' | 'carInfo' | 'insurance';
export type UserRole = 'traveler' | 'driver' ;

export interface FormData {
  role: UserRole | null;
  personalInfo: any;
  identityCard: any;
  driverLicense: any;
  carInfo: any;
  insurance: any;
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
};

export const travelerStepIds = ['role', 'personalInfo', 'identityCard'];
export const driverStepIds = ['role', 'personalInfo', 'identityCard', 'driverLicense', 'carInfo', 'insurance'];
