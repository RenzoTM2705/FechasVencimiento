import type { BatchView } from '@/types/domain';
import { statusFor, toIsoDate } from '@/lib/expiry';

let counter = 0;

/** Fecha base de las pruebas: 13 de noviembre de 2026. */
const TODAY = new Date(2026, 10, 13, 12, 0, 0, 0);

function isoFromOffset(days: number): string {
    const date = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + days, 12);
    return toIsoDate(date);
}

/**
 * Registro de ejemplo para pruebas. `daysRemaining` y `status` se derivan, y
 * la fecha de vencimiento se calcula del offset para que orden por fecha y por
 * días restantes coincidan.
 */
export function makeBatch(overrides: Partial<BatchView> = {}): BatchView {
    counter += 1;
    const daysRemaining = overrides.daysRemaining ?? 30;

    return {
        id: `batch-${counter}`,
        productId: 'p-default',
        productName: 'Producto de prueba',
        responsibleName: 'Ana',
        quantity: 1,
        expirationDate: isoFromOffset(daysRemaining),
        createdAt: '2026-11-01T12:00:00.000Z',
        updatedAt: '2026-11-01T12:00:00.000Z',
        daysRemaining,
        status: statusFor(daysRemaining),
        ...overrides,
    };
}
