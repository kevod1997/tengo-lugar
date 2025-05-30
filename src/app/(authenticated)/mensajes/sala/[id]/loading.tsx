import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/header/header";

export default function Loading() {
  return (
    <>
      <Header 
        breadcrumbs={[
          { label: 'Inicio', href: '/' },
          { label: 'Mensajes', href: '/mensajes' },
          { label: 'Cargando...' },
        ]} 
      />
      
      <div className="container mx-auto py-4 px-4">
        <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto">
          <Skeleton className="h-16 w-full mb-4" />
          <Skeleton className="flex-1 w-full mb-4" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </>
  );
}