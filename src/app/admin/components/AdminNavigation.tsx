import { Button } from "@/components/ui/button"

interface AdminNavigationProps {
  activeSection: string
  setActiveSection: (section: string) => void
}

export function AdminNavigation({ activeSection, setActiveSection }: AdminNavigationProps) {
  const navItems = [
    { id: 'overview', label: 'Vista General' },
    { id: 'analytics', label: 'Analíticas' },
    { id: 'reports', label: 'Reportes' },
  ]

  return (
    <nav className="flex space-x-2 mb-4">
      {navItems.map((item) => (
        <Button
          key={item.id}
          variant={activeSection === item.id ? "default" : "outline"}
          onClick={() => setActiveSection(item.id)}
        >
          {item.label}
        </Button>
      ))}
    </nav>
  )
}

