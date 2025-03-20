import Header from "@/components/header/header"
import DashboardContent from "./ui/dashboard/DashboardContent"

export default async function DashboardPage() {

  return (
    <>
      <Header 
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Dashboard' },
        ]} 
      />
      <DashboardContent/>
    </>
  )
}