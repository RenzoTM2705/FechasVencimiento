import { describeDays, STATUS_LABELS, toIsoDate } from './expiry';
import { formatDate } from './format';
import type { BatchView } from '@/types/domain';

export const EXPORT_HEADERS = [
    'Encargado',
    'Producto',
    'Cantidad',
    'Vencimiento',
    'Estado',
    'Días restantes',
] as const;

export type ExportFormat = 'csv' | 'xlsx';

export interface ExportRow {
    responsible: string;
    product: string;
    quantity: number;
    /** DD/MM/AAAA */
    expiration: string;
    status: string;
    days: string;
}

/**
 * Filas de exportación: un registro por fila, sin agrupar ni sumar cantidades.
 * Días y estado se calculan aquí, en el momento de exportar.
 */
export function buildExportRows(batches: BatchView[]): ExportRow[] {
    return batches.map((batch) => ({
        responsible: batch.responsibleName,
        product: batch.productName,
        quantity: batch.quantity,
        expiration: formatDate(batch.expirationDate),
        status: STATUS_LABELS[batch.status],
        days: describeDays(batch.daysRemaining),
    }));
}

function escapeCsv(value: string): string {
    return /[";\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/**
 * CSV para Excel en español: UTF-8 con BOM, separador `;` y CRLF.
 * Las comillas y los saltos de línea se escapan.
 */
export function toCsv(rows: ExportRow[]): string {
    const lines = rows.map((row) =>
        [
            row.responsible,
            row.product,
            String(row.quantity),
            row.expiration,
            row.status,
            row.days,
        ]
            .map(escapeCsv)
            .join(';'),
    );

    return `\uFEFF${EXPORT_HEADERS.join(';')}\r\n${lines.join('\r\n')}\r\n`;
}

export function exportFileName(format: ExportFormat, today: Date = new Date()): string {
    return `vencimientos-${toIsoDate(today)}.${format}`;
}

/** Descarga un archivo de texto en el navegador. */
export function downloadFile(content: string, fileName: string, type: string): void {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}
