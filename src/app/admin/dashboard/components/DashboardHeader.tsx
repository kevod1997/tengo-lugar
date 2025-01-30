interface DashboardHeaderProps {
    heading: string
    text?: string
  }
  
  export function DashboardHeader({ heading, text }: DashboardHeaderProps) {
    return (
      <div className="flex items-center justify-between px-2">
        <div className="grid gap-1">
          <h1 className="text-2xl font-bold tracking-wide text-primary">{heading}</h1>
          {text && <p className="text-muted-foreground">{text}</p>}
        </div>
      </div>
    )
  }
  
  