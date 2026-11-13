import type { BatchView } from '@/types/domain';

export interface ProductGroup {
    productId: string;
    productName: string;
    batches: BatchView[];
}

/**
 * Agrupa registros por producto **solo para visualización**: no fusiona
 * cantidades ni descarta registros. Ordena los grupos por el vencimiento más
 * próximo y, dentro de cada grupo, por fecha ascendente.
 */
export function groupByProduct(batches: BatchView[]): ProductGroup[] {
    const groups = new Map<string, ProductGroup>();

    for (const batch of batches) {
        const existing = groups.get(batch.productId);
        if (existing) {
            existing.batches.push(batch);
        } else {
            groups.set(batch.productId, {
                productId: batch.productId,
                productName: batch.productName,
                batches: [batch],
            });
        }
    }

    const result = [...groups.values()];

    for (const group of result) {
        group.batches.sort(
            (a, b) =>
                a.daysRemaining - b.daysRemaining ||
                a.expirationDate.localeCompare(b.expirationDate),
        );
    }

    result.sort(
        (a, b) =>
            a.batches[0].daysRemaining - b.batches[0].daysRemaining ||
            a.productName.localeCompare(b.productName, 'es'),
    );

    return result;
}
