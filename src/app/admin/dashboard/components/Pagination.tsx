import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface PaginationProps {
  total: number
  pageCount: number
  currentPage: number
  pageSize: number
}

export function Pagination({ total, pageCount, currentPage, pageSize }: PaginationProps) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        {total} Usuarios
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Pagina {currentPage} de {pageCount}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            disabled={currentPage === 1}
          >
            <Link href={`?page=${currentPage - 1}&pageSize=${pageSize}`}>
              <span className="sr-only">Pagina anterior</span>
              <ChevronLeftIcon className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            disabled={currentPage === pageCount}
          >
            <Link href={`?page=${currentPage + 1}&pageSize=${pageSize}`}>
              <span className="sr-only">Pagina posterior</span>
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

