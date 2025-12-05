'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Edit, Power, Fuel } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { fuelTypeLabels, fuelTypeColors } from '@/types/fuel-price'
import type { FuelPriceListItem} from '@/types/fuel-price';

import { EditFuelPriceDialog } from './EditFuelPriceDialog'
import { ToggleStatusDialog } from './ToggleStatusDialog'

interface FuelPriceTableProps {
  fuelPrices: FuelPriceListItem[]
}

export function FuelPriceTable({ fuelPrices }: FuelPriceTableProps) {
  const router = useRouter()
  const [selectedFuelPrice, setSelectedFuelPrice] = useState<FuelPriceListItem | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showToggleDialog, setShowToggleDialog] = useState(false)

  const handleEdit = (fuelPrice: FuelPriceListItem) => {
    setSelectedFuelPrice(fuelPrice)
    setShowEditDialog(true)
  }

  const handleToggleStatus = (fuelPrice: FuelPriceListItem) => {
    setSelectedFuelPrice(fuelPrice)
    setShowToggleDialog(true)
  }

  const handleSuccess = () => {
    setSelectedFuelPrice(null)
    setShowEditDialog(false)
    setShowToggleDialog(false)
    router.refresh()
  }

  if (fuelPrices.length === 0) {
    return (
      <div className="text-center py-12">
        <Fuel className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No hay precios</h3>
        <p className="mt-1 text-sm text-gray-500">
          No se encontraron precios de combustible con los filtros seleccionados.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo de Combustible</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Fecha Efectiva</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fuelPrices.map((fuelPrice) => (
              <TableRow key={fuelPrice.id}>
                <TableCell>
                  <span className="font-medium">{fuelPrice.name}</span>
                </TableCell>
                <TableCell>
                  <Badge className={fuelTypeColors[fuelPrice.fuelType]}>
                    {fuelTypeLabels[fuelPrice.fuelType]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-lg">
                    ${fuelPrice.price.toLocaleString('es-AR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {format(new Date(fuelPrice.effectiveDate), 'dd MMM yyyy', { locale: es })}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={fuelPrice.isActive ? 'default' : 'secondary'}>
                    {fuelPrice.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(fuelPrice)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant={fuelPrice.isActive ? 'destructive' : 'default'}
                      size="sm"
                      onClick={() => handleToggleStatus(fuelPrice)}
                    >
                      <Power className="h-4 w-4 mr-1" />
                      {fuelPrice.isActive ? 'Desactivar' : 'Activar'}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedFuelPrice && (
        <>
          <EditFuelPriceDialog
            fuelPrice={selectedFuelPrice}
            open={showEditDialog}
            onSuccess={handleSuccess}
            onCancel={() => {
              setShowEditDialog(false)
              setSelectedFuelPrice(null)
            }}
          />
          <ToggleStatusDialog
            fuelPrice={selectedFuelPrice}
            open={showToggleDialog}
            onSuccess={handleSuccess}
            onCancel={() => {
              setShowToggleDialog(false)
              setSelectedFuelPrice(null)
            }}
          />
        </>
      )}
    </>
  )
}
