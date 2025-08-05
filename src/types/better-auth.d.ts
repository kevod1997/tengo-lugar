import 'better-auth';

declare module 'better-auth' {
  interface User {
    birthDate?: Date;
    gender?: string;
    profileImageKey?: string;
    profil
  }
}