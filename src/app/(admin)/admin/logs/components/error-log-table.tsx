'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface ErrorLog {
    id: string
    origin: string
    code: string
    message: string
    createdAt: string
    details: string | null
}

interface ErrorLogTableProps {
    errorLogs: ErrorLog[]
    currentPage: number
    totalPages: number
    uniqueOrigins: string[]
    uniqueCodes: string[]
    initialOrigin?: string
    initialCode?: string
}

function formatDate(dateString: string): string {
    return dateString.replace('T', ' ').substring(0, 19)
}

export function ErrorLogTable({
    errorLogs,
    currentPage,
    totalPages,
    uniqueOrigins,
    uniqueCodes,
    initialOrigin,
    initialCode
}: ErrorLogTableProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [origin, setOrigin] = useState(initialOrigin || '')
    const [code, setCode] = useState(initialCode || '')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setOrigin(initialOrigin || '')
        setCode(initialCode || '')
        setIsLoading(false)
    }, [initialOrigin, initialCode])

    const handleFilter = () => {
        const params = new URLSearchParams(searchParams.toString())
        if (origin) {
            params.set('origin', origin)
        } else {
            params.delete('origin')
        }
        if (code) {
            params.set('code', code)
        } else {
            params.delete('code')
        }
        params.set('page', '1')
        router.push(`/admin/logs?${params.toString()}`)
    }

    const handleClearFilters = () => {
        setOrigin('')
        setCode('')
        router.push('/admin/logs')
    }

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', newPage.toString())
        router.push(`/admin/logs?${params.toString()}`)
    }

    if (isLoading) {
        return <div>Loading error logs...</div>
    }

    return (
        <div>
            <div className="mb-4 flex gap-4">
                <select
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="border p-2 rounded"
                >
                    <option value="">All Origins</option>
                    {uniqueOrigins.map((o) => (
                        <option key={o} value={o}>{o}</option>
                    ))}
                </select>
                <select
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="border p-2 rounded"
                >
                    <option value="">All Codes</option>
                    {uniqueCodes.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
                <button
                    onClick={handleFilter}
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                    Apply Filters
                </button>
                <button
                    onClick={handleClearFilters}
                    className="bg-gray-300 text-gray-700 p-2 rounded hover:bg-gray-400"
                >
                    Clear Filters
                </button>
            </div>
            <table className="min-w-full bg-white">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">Origin</th>
                        <th className="py-2 px-4 border-b">Code</th>
                        <th className="py-2 px-4 border-b">Message</th>
                        <th className="py-2 px-4 border-b">Details</th>
                        <th className="py-2 px-4 border-b">Created At</th>
                    </tr>
                </thead>
                <tbody>
                    {errorLogs.map((log) => {
                        // Intentamos parsear los details como JSON
                        let parsedDetails;
                        try {
                            parsedDetails = JSON.parse(log.details || '{}');
                        } catch (e) {
                            console.log(e)
                            parsedDetails = {};
                        }

                        return (
                            <tr key={log.id}>
                                <td className="py-2 px-4 border-b">{log.origin}</td>
                                <td className="py-2 px-4 border-b">{log.code}</td>
                                <td className="py-2 px-4 border-b">{log.message}</td>
                                <td className="py-2 px-4 border-b">
                                    {parsedDetails.fileName && <div>Archivo: {parsedDetails.fileName}</div>}
                                    {parsedDetails.functionName && <div>Funcion: {parsedDetails.functionName}</div>}
                                    {parsedDetails.additionalDetails && (
                                        <div>Additional: {parsedDetails.additionalDetails}</div>
                                    )}
                                </td>
                                <td className="py-2 px-4 border-b">{formatDate(log.createdAt)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <div className="mt-4 flex justify-between">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="bg-blue-500 text-white p-2 rounded disabled:bg-gray-300"
                >
                    Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="bg-blue-500 text-white p-2 rounded disabled:bg-gray-300"
                >
                    Next
                </button>
            </div>
        </div>
    )
}

