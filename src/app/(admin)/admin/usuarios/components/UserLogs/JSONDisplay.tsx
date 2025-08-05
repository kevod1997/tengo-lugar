"use client"

import { useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import type { JsonValue } from "@prisma/client/runtime/library"

interface JSONDisplayProps {
  data: JsonValue
  label: string
}

export function JSONDisplay({ data, label }: JSONDisplayProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!data || (typeof data === "object" && Object.keys(data).length === 0)) {
    return null
  }

  const formattedData = JSON.stringify(data, null, 2)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center justify-between w-full p-0">
          <span>{label}</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <pre className="text-xs whitespace-pre-wrap bg-muted p-2 rounded-md mt-2 max-h-48 overflow-y-auto">
          <code>{formattedData}</code>
        </pre>
      </CollapsibleContent>
    </Collapsible>
  )
}

