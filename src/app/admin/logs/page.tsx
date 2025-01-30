import { Suspense } from 'react'
import Header from '@/components/header/header'
import { ErrorLogTable } from './components/error-log-table'
import { fetchErrorLogs } from '@/actions/logs/error-logs'

export default async function ErrorLogsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    return (
        <div className="container mx-auto p-4">
            <Header
                breadcrumbs={[
                    { label: 'Home', href: '/' },
                    { label: 'Admin', href: '/admin' },
                    { label: 'Logs' },
                ]}
            />
            <Suspense fallback={<div>Loading error logs...</div>}>
                <ErrorLogsContent searchParams={searchParams} />
            </Suspense>
        </div>
    )
}

async function ErrorLogsContent({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const page = Number(params.page) || 1
    const pageSize = 10

    const getSearchParam = (param: string) => {
        const value = params[param]
        return typeof value === 'string' ? value : undefined
    }

    const originParam = getSearchParam('origin')
    const codeParam = getSearchParam('code')

    try {
        const { errorLogs, totalPages, uniqueOrigins, uniqueCodes } = await fetchErrorLogs({
            page,
            pageSize,
            origin: originParam,
            code: codeParam
        })

        return (
            <ErrorLogTable
                errorLogs={errorLogs}
                currentPage={page}
                totalPages={totalPages}
                uniqueOrigins={uniqueOrigins}
                uniqueCodes={uniqueCodes}
                initialOrigin={originParam}
                initialCode={codeParam}
            />
        )
    } catch (error) {
        console.error('Error fetching error logs:', error)
        return <p>Failed to fetch error logs. Please try again later.</p>
    }
}

