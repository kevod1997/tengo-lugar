'use client'

import { useState } from 'react'
import { BankAccountForAdmin } from '@/actions/admin/bank-account/get-bank-accounts'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, Wallet } from 'lucide-react'
import { VerifyBankAccountDialog } from './VerifyBankAccountDialog'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface BankAccountTableProps {
  bankAccounts: BankAccountForAdmin[]
}

export function BankAccountTable({ bankAccounts }: BankAccountTableProps) {
  const [selectedAccount, setSelectedAccount] = useState<BankAccountForAdmin | null>(null)
  const [showVerifyDialog, setShowVerifyDialog] = useState(false)

  const handleVerify = (account: BankAccountForAdmin) => {
    setSelectedAccount(account)
    setShowVerifyDialog(true)
  }

  const handleCloseDialog = () => {
    setSelectedAccount(null)
    setShowVerifyDialog(false)
  }

  if (bankAccounts.length === 0) {
    return (
      <div className="text-center py-12">
        <Wallet className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No hay cuentas bancarias</h3>
        <p className="mt-1 text-sm text-gray-500">
          No se encontraron cuentas bancarias con los filtros seleccionados.
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
              <TableHead>Usuario</TableHead>
              <TableHead>Alias Bancario</TableHead>
              <TableHead>Titular</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha Creación</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bankAccounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{account.userName}</span>
                    <span className="text-sm text-muted-foreground">{account.userEmail}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm">{account.bankAlias}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{account.accountOwner}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {account.userPhoneNumber || (
                      <span className="text-muted-foreground">Sin teléfono</span>
                    )}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={account.isVerified ? 'default' : 'secondary'}
                    className={account.isVerified ? 'bg-green-500' : 'bg-yellow-500'}
                  >
                    {account.isVerified ? 'Verificado ✓' : 'Pendiente'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm">
                      {format(new Date(account.createdAt), 'dd/MM/yyyy', { locale: es })}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(account.createdAt), 'HH:mm', { locale: es })}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {!account.isVerified ? (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleVerify(account)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Verificar
                    </Button>
                  ) : (
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-muted-foreground">
                        Verificado
                      </span>
                      {account.verifiedAt && (
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(account.verifiedAt), 'dd/MM/yyyy', { locale: es })}
                        </span>
                      )}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedAccount && (
        <VerifyBankAccountDialog
          open={showVerifyDialog}
          onOpenChange={handleCloseDialog}
          bankAccountId={selectedAccount.id}
          bankAlias={selectedAccount.bankAlias}
          userName={selectedAccount.userName}
        />
      )}
    </>
  )
}
