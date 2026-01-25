import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
    key: keyof T | string;
    header: string;
    render?: (item: T) => React.ReactNode;
    sortable?: boolean;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    title?: string;
    icon?: React.ReactNode;
    onRowClick?: (item: T) => void;
    pagination?: boolean;
    itemsPerPage?: number;
}

export function DataTable<T extends Record<string, any>>({
    data,
    columns,
    title,
    icon,
    onRowClick,
    pagination = false,
    itemsPerPage = 10,
}: DataTableProps<T>) {
    const [currentPage, setCurrentPage] = React.useState(1);
    const [sortConfig, setSortConfig] = React.useState<{
        key: string;
        direction: 'asc' | 'desc';
    } | null>(null);

    // Sorting logic
    const sortedData = React.useMemo(() => {
        if (!sortConfig) return data;

        return [...data].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [data, sortConfig]);

    // Pagination logic
    const paginatedData = React.useMemo(() => {
        if (!pagination) return sortedData;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return sortedData.slice(startIndex, endIndex);
    }, [sortedData, currentPage, itemsPerPage, pagination]);

    const totalPages = Math.ceil(data.length / itemsPerPage);

    const handleSort = (key: string) => {
        setSortConfig((current) => {
            if (!current || current.key !== key) {
                return { key, direction: 'asc' };
            }
            if (current.direction === 'asc') {
                return { key, direction: 'desc' };
            }
            return null;
        });
    };

    const getCellValue = (item: T, column: Column<T>) => {
        if (column.render) {
            return column.render(item);
        }
        return item[column.key as keyof T];
    };

    return (
        <Card className="glass-card">
            {title && (
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {icon}
                        {title}
                    </CardTitle>
                </CardHeader>
            )}
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                {columns.map((column, index) => (
                                    <th
                                        key={index}
                                        className={`px-4 py-3 text-left text-sm font-semibold text-gray-700 ${column.sortable ? 'cursor-pointer hover:bg-gray-50' : ''
                                            }`}
                                        onClick={() => column.sortable && handleSort(column.key as string)}
                                    >
                                        <div className="flex items-center gap-2">
                                            {column.header}
                                            {column.sortable && sortConfig?.key === column.key && (
                                                <span className="text-xs">
                                                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="px-4 py-8 text-center text-gray-500"
                                    >
                                        No hay datos para mostrar
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((item, rowIndex) => (
                                    <tr
                                        key={rowIndex}
                                        className={`border-b border-gray-100 transition-colors ${onRowClick
                                                ? 'cursor-pointer hover:bg-gray-50'
                                                : ''
                                            }`}
                                        onClick={() => onRowClick?.(item)}
                                    >
                                        {columns.map((column, colIndex) => (
                                            <td
                                                key={colIndex}
                                                className="px-4 py-3 text-sm text-gray-900"
                                            >
                                                {getCellValue(item, column)}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination && totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                            Mostrando {(currentPage - 1) * itemsPerPage + 1} a{' '}
                            {Math.min(currentPage * itemsPerPage, data.length)} de {data.length}{' '}
                            resultados
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <span className="px-3 py-1 text-sm">
                                Página {currentPage} de {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default DataTable;
