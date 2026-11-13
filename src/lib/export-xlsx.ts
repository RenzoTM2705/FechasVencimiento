import writeXlsxFile, { type Cell, type SheetData } from 'write-excel-file/browser';
import { EXPORT_HEADERS, type ExportRow } from './export';

const COLUMNS = [
    { width: 22 },
    { width: 26 },
    { width: 10 },
    { width: 14 },
    { width: 18 },
    { width: 16 },
];

/**
 * Genera y descarga un .xlsx con una sola hoja y las mismas columnas que el CSV.
 *
 * API de write-excel-file v4: `writeXlsxFile(data, sheetOptions)` devuelve
 * `{ toFile, toBlob }`; el archivo se escribe en el navegador.
 */
export async function downloadXlsx(rows: ExportRow[], fileName: string): Promise<void> {
    const header: Cell[] = EXPORT_HEADERS.map((value) => ({ value, fontWeight: 'bold' }));

    const body: Cell[][] = rows.map((row) => [
        { value: row.responsible },
        { value: row.product },
        { value: row.quantity, type: Number },
        { value: row.expiration },
        { value: row.status },
        { value: row.days },
    ]);

    const data: SheetData = [header, ...body];

    await writeXlsxFile(data, { sheet: 'Vencimientos', columns: COLUMNS }).toFile(fileName);
}
