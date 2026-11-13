import { describe, expect, it } from 'vitest';
import { makeBatch } from '@/test/factories';
import { buildExportRows, exportFileName, toCsv } from './export';

const BATCHES = [
    makeBatch({
        productName: 'Leche Gloria',
        responsibleName: 'Carlos',
        quantity: 6,
        expirationDate: '2026-11-10',
        daysRemaining: -3,
    }),
    makeBatch({
        productName: 'Yogurt; "Laive"',
        responsibleName: 'María',
        quantity: 9,
        expirationDate: '2026-11-20',
        daysRemaining: 7,
    }),
];

describe('buildExportRows', () => {
    it('genera una fila por registro con estado y días calculados', () => {
        const rows = buildExportRows(BATCHES);

        expect(rows).toHaveLength(2);
        expect(rows[0]).toEqual({
            responsible: 'Carlos',
            product: 'Leche Gloria',
            quantity: 6,
            expiration: '10/11/2026',
            status: 'Vencido',
            days: 'Venció hace 3 días',
        });
        expect(rows[1].status).toBe('Crítico');
        expect(rows[1].days).toBe('7 días');
    });

    it('no agrupa ni suma cantidades del mismo producto', () => {
        const repeated = [
            makeBatch({ productName: 'Leche Gloria', quantity: 10, daysRemaining: 5 }),
            makeBatch({ productName: 'Leche Gloria', quantity: 4, daysRemaining: 5 }),
        ];

        const rows = buildExportRows(repeated);
        expect(rows).toHaveLength(2);
        expect(rows.map((row) => row.quantity)).toEqual([10, 4]);
    });
});

describe('toCsv', () => {
    it('incluye BOM, separador ; y encabezados', () => {
        const csv = toCsv(buildExportRows(BATCHES));
        const [header] = csv.split('\r\n');

        expect(csv.startsWith('\uFEFF')).toBe(true);
        expect(header).toBe(
            '\uFEFFEncargado;Producto;Cantidad;Vencimiento;Estado;Días restantes',
        );
    });

    it('escapa punto y coma y comillas', () => {
        const csv = toCsv(buildExportRows(BATCHES));

        expect(csv).toContain('María;"Yogurt; ""Laive"""');
    });

    it('termina cada línea con CRLF', () => {
        const csv = toCsv(buildExportRows(BATCHES));
        expect(csv.endsWith('\r\n')).toBe(true);
        expect(csv.split('\r\n')).toHaveLength(4);
    });
});

describe('exportFileName', () => {
    it('usa la fecha del día y la extensión del formato', () => {
        expect(exportFileName('csv', new Date(2026, 10, 13))).toBe('vencimientos-2026-11-13.csv');
        expect(exportFileName('xlsx', new Date(2026, 0, 5))).toBe('vencimientos-2026-01-05.xlsx');
    });
});
