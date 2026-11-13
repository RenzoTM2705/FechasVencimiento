import type { BatchView } from '@/types/domain';
import { daysRemaining, statusFor, toIsoDate } from './expiry';

/**
 * DATOS DE EJEMPLO — SOLO PARA LA FASE 2.
 *
 * Permiten validar la interfaz antes de conectar Supabase. Se eliminan en la
 * Fase 4, cuando los servicios reales sustituyan a este módulo (regla 7 del
 * prompt maestro: los datos simulados no sustituyen la persistencia).
 */

interface MockSeed {
    productId: string;
    productName: string;
    responsibleName: string;
    quantity: number;
    /** Días respecto de hoy: negativo = ya venció. */
    offsetDays: number;
}

const SEEDS: MockSeed[] = [
    { productId: 'p-leche', productName: 'Leche Gloria', responsibleName: 'Carlos', quantity: 6, offsetDays: -3 },
    { productId: 'p-leche', productName: 'Leche Gloria', responsibleName: 'María', quantity: 12, offsetDays: 0 },
    { productId: 'p-leche', productName: 'Leche Gloria', responsibleName: 'Carlos', quantity: 10, offsetDays: 5 },
    { productId: 'p-leche', productName: 'Leche Gloria', responsibleName: 'María', quantity: 24, offsetDays: 12 },
    { productId: 'p-leche', productName: 'Leche Gloria', responsibleName: 'Carlos', quantity: 8, offsetDays: 26 },
    { productId: 'p-yogurt', productName: 'Yogurt Laive', responsibleName: 'María', quantity: 9, offsetDays: 2 },
    { productId: 'p-yogurt', productName: 'Yogurt Laive', responsibleName: 'Carlos', quantity: 15, offsetDays: 9 },
    { productId: 'p-yogurt', productName: 'Yogurt Laive', responsibleName: 'María', quantity: 6, offsetDays: 18 },
    { productId: 'p-pan', productName: 'Pan de molde Bimbo', responsibleName: 'Carlos', quantity: 4, offsetDays: 1 },
    { productId: 'p-queso', productName: 'Queso fresco', responsibleName: 'María', quantity: 3, offsetDays: 20 },
    { productId: 'p-queso', productName: 'Queso fresco', responsibleName: 'Carlos', quantity: 2, offsetDays: 45 },
    { productId: 'p-jugo', productName: 'Jugo Pura Vida', responsibleName: 'Carlos', quantity: 7, offsetDays: 0 },
];

function addDays(base: Date, days: number): string {
    const copy = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 12, 0, 0, 0);
    copy.setDate(copy.getDate() + days);
    return toIsoDate(copy);
}

export function createMockBatches(today: Date = new Date()): BatchView[] {
    return SEEDS.map((seed, index) => {
        const expirationDate = addDays(today, seed.offsetDays);
        const days = daysRemaining(expirationDate, today);
        const createdAt = new Date(today.getTime() - (index + 1) * 3_600_000).toISOString();

        return {
            id: `mock-${index + 1}`,
            productId: seed.productId,
            productName: seed.productName,
            responsibleName: seed.responsibleName,
            quantity: seed.quantity,
            expirationDate,
            createdAt,
            updatedAt: createdAt,
            daysRemaining: days,
            status: statusFor(days),
        } satisfies BatchView;
    });
}
