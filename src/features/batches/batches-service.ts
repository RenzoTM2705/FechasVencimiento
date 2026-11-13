import type { BatchView } from '@/types/domain';
import { daysRemaining, statusFor } from '@/lib/expiry';

/**
 * Servicio de datos de la Fase 3.
 *
 * Mantiene los registros en memoria para poder validar altas, edición y
 * eliminación antes de conectar Supabase. En la Fase 4 este módulo se sustituye
 * por la implementación real (misma interfaz) sin tocar la interfaz de usuario.
 */

export interface NewBatch {
    responsibleName: string;
    productName: string;
    quantity: number;
    expirationDate: string;
}

export interface BatchesService {
    list(): Promise<BatchView[]>;
    createMany(inputs: NewBatch[]): Promise<BatchView[]>;
}

interface StoredBatch {
    id: string;
    productId: string;
    productName: string;
    responsibleName: string;
    quantity: number;
    expirationDate: string;
    createdAt: string;
}

function productIdFor(productName: string): string {
    return `p-${productName.trim().toLowerCase().replace(/\s+/g, '-')}`;
}

function toView(batch: StoredBatch, today: Date): BatchView {
    const days = daysRemaining(batch.expirationDate, today);

    return {
        id: batch.id,
        productId: batch.productId,
        productName: batch.productName,
        responsibleName: batch.responsibleName,
        quantity: batch.quantity,
        expirationDate: batch.expirationDate,
        createdAt: batch.createdAt,
        updatedAt: batch.createdAt,
        daysRemaining: days,
        status: statusFor(days),
    };
}

function daysFromToday(offset: number, today: Date): string {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset, 12);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
        date.getDate(),
    ).padStart(2, '0')}`;
}

function seed(today: Date): StoredBatch[] {
    const rows: Array<[string, string, number, number]> = [
        ['Leche Gloria', 'Carlos', 6, -3],
        ['Leche Gloria', 'María', 12, 0],
        ['Leche Gloria', 'Carlos', 10, 5],
        ['Leche Gloria', 'María', 24, 12],
        ['Leche Gloria', 'Carlos', 8, 26],
        ['Yogurt Laive', 'María', 9, 2],
        ['Yogurt Laive', 'Carlos', 15, 9],
        ['Yogurt Laive', 'María', 6, 18],
        ['Pan de molde Bimbo', 'Carlos', 4, 1],
        ['Queso fresco', 'María', 3, 20],
        ['Queso fresco', 'Carlos', 2, 45],
        ['Jugo Pura Vida', 'Carlos', 7, 0],
    ];

    return rows.map(([productName, responsibleName, quantity, offset], index) => ({
        id: `seed-${index + 1}`,
        productId: productIdFor(productName),
        productName,
        responsibleName,
        quantity,
        expirationDate: daysFromToday(offset, today),
        createdAt: new Date(today.getTime() - (index + 1) * 60_000).toISOString(),
    }));
}

function createMemoryService(): BatchesService {
    const today = new Date();
    let stored = seed(today);
    let sequence = stored.length;

    return {
        async list() {
            return stored
                .map((batch) => toView(batch, new Date()))
                .sort((a, b) => a.expirationDate.localeCompare(b.expirationDate));
        },

        async createMany(inputs) {
            const createdAt = new Date().toISOString();

            const created = inputs.map((input) => {
                sequence += 1;
                return {
                    id: `new-${sequence}`,
                    productId: productIdFor(input.productName),
                    productName: input.productName,
                    responsibleName: input.responsibleName,
                    quantity: input.quantity,
                    expirationDate: input.expirationDate,
                    createdAt,
                } satisfies StoredBatch;
            });

            stored = [...stored, ...created];
            return created.map((batch) => toView(batch, new Date()));
        },
    };
}

let instance: BatchesService | null = null;

export function getBatchesService(): BatchesService {
    if (!instance) instance = createMemoryService();
    return instance;
}
