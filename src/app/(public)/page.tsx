import Header from "@/components/header/header"

export default function Page() {
  
  return (
    <>
    <Header breadcrumbs={[{ label: 'Inicio', href: '/' }]} showBackButton={false} />
    <div className="container mx-auto py-8">
    </div>
    </>
  )
}