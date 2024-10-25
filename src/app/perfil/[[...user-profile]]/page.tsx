import Header from '@/components/header/header'
import { UserProfile } from '@clerk/nextjs'

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