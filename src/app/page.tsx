import Header from "@/components/header/header";
import { useUserStore } from "@/store/user-store";


export default async function Home() {
  return (
    <div>
      <Header breadcrumbs={[{ label: 'Home', href: '/' }] } showBackButton={false} />
      Hola mundo 
    </div>
  );
}
