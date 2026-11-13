import { describe, expect, it } from 'vitest';
import { makeBatch } from '@/test/factories';
import { groupByProduct } from './grouping';

describe('groupByProduct', () => {
    it('agrupa por producto sin fusionar ni sumar registros', () => {
        const batches = [
            makeBatch({ productId: 'p1', productName: 'Leche Gloria', daysRemaining: 5 }),
            makeBatch({ productId: 'p1', productName: 'Leche Gloria', daysRemaining: 0 }),
            makeBatch({ productId: 'p2', productName: 'Yogurt', daysRemaining: 12 }),
        ];

        const groups = groupByProduct(batches);

        expect(groups).toHaveLength(2);
        expect(groups[0].productName).toBe('Leche Gloria');
        expect(groups[0].batches).toHaveLength(2);
        expect(groups[1].batches).toHaveLength(1);
    });

    it('ordena los grupos por el vencimiento más próximo', () => {
        const batches = [
            makeBatch({ productId: 'p2', productName: 'Queso', daysRemaining: 20 }),
            makeBatch({ productId: 'p1', productName: 'Leche', daysRemaining: 1 }),
        ];

        expect(groupByProduct(batches).map((group) => group.productName)).toEqual([
            'Leche',
            'Queso',
        ]);
    });

    it('ordena los registros dentro del grupo de más próximo a más lejano', () => {
        const batches = [
            makeBatch({ productId: 'p1', productName: 'Leche', daysRemaining: 18 }),
            makeBatch({ productId: 'p1', productName: 'Leche', daysRemaining: -2 }),
            makeBatch({ productId: 'p1', productName: 'Leche', daysRemaining: 4 }),
        ];

        expect(groupByProduct(batches)[0].batches.map((batch) => batch.daysRemaining)).toEqual([
            -2, 4, 18,
        ]);
    });

    it('desempata por nombre de producto cuando comparten vencimiento', () => {
        const batches = [
            makeBatch({ productId: 'p2', productName: 'Zanahoria', daysRemaining: 3 }),
            makeBatch({ productId: 'p1', productName: 'Arroz', daysRemaining: 3 }),
        ];

        expect(groupByProduct(batches).map((group) => group.productName)).toEqual([
            'Arroz',
            'Zanahoria',
        ]);
    });
});
