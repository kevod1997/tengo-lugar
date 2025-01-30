import Header from '@/components/header/header'
import { UserProfile } from '@clerk/nextjs'

//todo VER BIEN EL TEMA DE BORRAR EL USUARIO SI SE PUEDE EVITAR O NO

const UserProfilePage = () => (
  <div className="flex flex-col w-full">
    <Header 
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Perfil' }]} 
      showBackButton={false}
    />
    <div className="mt-6 w-full flex justify-center">
      <UserProfile path="/perfil" />
    </div>
  </div>
)

export default UserProfilePage