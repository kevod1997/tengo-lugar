import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import RegistrationFlow from "./ui/registration-flow"
import { SidebarTrigger } from "@/components/ui/sidebar"
import Header from "@/components/header/header"

export default function DashboardPage() {

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Dashboard' },
  ]
  return (
    <>
      <Header breadcrumbs={breadcrumbs}/>
      <Separator className="mb-6" />
      <div className="flex flex-col gap-6">
        <RegistrationFlow />
      </div>
    </>
  )
}