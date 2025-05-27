import { Button } from '@/components/ui/button'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import Link from 'next/link'

interface PaginationProps {
  total: number
  pageCount: number
  currentPage: number
  pageSize: number

  // For URL-based navigation
  urlBased?: boolean

  // For state-based navigation
  onPageChange?: (page: number) => void

  // Optional label for the total count
  totalLabel?: string
}

export function Pagination({
  total,
  pageCount,
  currentPage,
  pageSize,
  urlBased = false,
  onPageChange,
  totalLabel = "Registros"
}: PaginationProps) {

  // Ensure we have a proper onPageChange function if not URL-based
  if (!urlBased && !onPageChange) {
    console.warn('Pagination: onPageChange is required when urlBased is false');
  }

  const handlePageChange = (page: number) => {
    if (!urlBased && onPageChange) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        {total} {totalLabel}
      </div>
      {
        pageCount > 1 && (
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              Página {currentPage} de {pageCount || 1}
            </div>
            <div className="flex items-center space-x-2">
              {urlBased ? (
                // URL-based navigation using Links
                <>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    disabled={currentPage <= 1}
                  >
                    <Link href={`?page=${currentPage - 1}&pageSize=${pageSize}`}>
                      <span className="sr-only">Página anterior</span>
                      <ChevronLeftIcon className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    disabled={currentPage >= pageCount}
                  >
                    <Link href={`?page=${currentPage + 1}&pageSize=${pageSize}`}>
                      <span className="sr-only">Página siguiente</span>
                      <ChevronRightIcon className="h-4 w-4" />
                    </Link>
                  </Button>
                </>
              ) : (
                // State-based navigation using onClick handlers
                <>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    disabled={currentPage <= 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    <span className="sr-only">Página anterior</span>
                    <ChevronLeftIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    disabled={currentPage >= pageCount}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    <span className="sr-only">Página siguiente</span>
                    <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        )
      }
    </div>
  )
}