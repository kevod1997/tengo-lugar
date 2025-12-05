import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/utils/format/formatDate"


import { JSONDisplay } from "./JSONDisplay"

import type { JsonValue } from "@prisma/client/runtime/library"

interface UserLog {
  id: string
  action: string
  details: JsonValue
  status: string
  metadata: JsonValue
  createdAt: Date
  user: {
    firstName: string
    lastName: string
    email: string
  }
}

interface UserLogsTableProps {
  logs: UserLog[]
}

export function UserLogsTable({ logs }: UserLogsTableProps) {
  return (
    <div className="rounded-md border">
      <ScrollArea className="h-[400px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Acción</TableHead>
              <TableHead className="w-[100px]">Estado</TableHead>
              <TableHead className="w-[200px]">Detalles</TableHead>
              <TableHead className="w-[200px]">Metadata</TableHead>
              <TableHead className="w-[150px]">Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">{log.action}</TableCell>
                <TableCell>
                  <Badge variant={log.status === "SUCCESS" ? "success" : "destructive"}>{log.status}</Badge>
                </TableCell>
                <TableCell>
                  <JSONDisplay data={log.details} label="Ver detalles" />
                </TableCell>
                <TableCell>
                  <JSONDisplay data={log.metadata} label="Ver metadata" />
                </TableCell>
                <TableCell>{formatDate(log.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}

