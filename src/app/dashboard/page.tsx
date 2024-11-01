import { Separator } from "@/components/ui/separator"
import Header from "@/components/header/header"
import RegistrationFlow from "./ui/registration/registration-flow"

export default function DashboardPage() {

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Dashboard' },
  ]
  return (
    <>
      <Header breadcrumbs={breadcrumbs} />
      <Separator className="mb-6" />
      <div className="flex flex-col gap-6">
        <RegistrationFlow />
      </div>
    </>
  )
}