"use client";

import { getUserLogs } from "@/actions/logs/get-user-logs";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingOverlay } from "@/components/loader/loading-overlay";
import { UserLogsTable } from "./UserLogsTable";
import { TipoAccionUsuario } from "@/types/actions-logs";
import { Pagination } from "../Pagination";

interface UserLogsViewProps {
  userId: string;
}

export function UserLogsView({ userId }: UserLogsViewProps) {
  const [logs, setLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    total: 0,
    pageCount: 0,
  })

  const [filters, setFilters] = useState({
    action: "",
    status: "ALL",
    startDate: "",
    endDate: "",
  })

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true)
      try {
        const response = await getUserLogs({
          userId,
          page: pagination.currentPage,
          pageSize: pagination.pageSize,
          action: filters.action || undefined,
          status: filters.status === "ALL" ? undefined : filters.status,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
        })
  
        if (response.success && response.data) {
          setLogs(response.data.logs)
          setPagination(response.data.pagination)
        }
      } catch (error) {
        console.error("Error fetching logs:", error)
      } finally {
        setIsLoading(false)
      }
    }
  
    fetchLogs()
  }, [userId, pagination.currentPage, pagination.pageSize, filters])

  const actionOptions = Object.entries(TipoAccionUsuario).map(([key, value]) => ({
    label: key
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" "),
    value: value,
  }))

  // Add this function to handle page changes
  const handlePageChange = (page: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Actividad</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Select
              value={filters.action}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, action: value }))}
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Filtrar por acción" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las acciones</SelectItem>
                {actionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="SUCCESS">Exitoso</SelectItem>
                <SelectItem value="FAILED">Fallido</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
              className="w-[200px]"
            />
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
              className="w-[200px]"
            />
          </div>

          {isLoading ? (
            <LoadingOverlay isLoading={true} />
          ) : (
            <>
              <UserLogsTable logs={logs} />
              <Pagination
                total={pagination.total}
                pageCount={pagination.pageCount}
                currentPage={pagination.currentPage}
                pageSize={pagination.pageSize}
                urlBased={false}
                onPageChange={handlePageChange}
                totalLabel="Logs"
              />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}