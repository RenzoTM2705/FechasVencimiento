import { describe, expect, it } from 'vitest';
import { makeBatch } from '@/test/factories';
import { productOptions, suggestProducts, uniqueProductNames } from './products';

describe('uniqueProductNames', () => {
    it('deduplica sin distinguir mayúsculas ni acentos y conserva el primer nombre visible', () => {
        const batches = [
            makeBatch({ productName: 'Leche Gloria' }),
            makeBatch({ productName: 'LECHE GLORIA' }),
            makeBatch({ productName: '  leche gloria  ' }),
            makeBatch({ productName: 'Yogurt Laive' }),
        ];

        expect(uniqueProductNames(batches)).toEqual(['Leche Gloria', 'Yogurt Laive']);
    });

    it('devuelve una lista vacía sin registros', () => {
        expect(uniqueProductNames([])).toEqual([]);
    });
});

describe('productOptions', () => {
    it('devuelve productos únicos ordenados por nombre', () => {
        const batches = [
            makeBatch({ productId: 'p-yogurt', productName: 'Yogurt Laive' }),
            makeBatch({ productId: 'p-leche', productName: 'Leche Gloria' }),
            makeBatch({ productId: 'p-leche', productName: 'Leche Gloria' }),
        ];

        expect(productOptions(batches)).toEqual([
            { id: 'p-leche', name: 'Leche Gloria' },
            { id: 'p-yogurt', name: 'Yogurt Laive' },
        ]);
    });
});

describe('suggestProducts', () => {
    const catalog = ['Leche Gloria', 'Yogurt Laive', 'Pan de molde Bimbo', 'Jugo Pura Vida'];

    it('sugiere por inclusión sin distinguir mayúsculas ni acentos', () => {
        expect(suggestProducts('lec', catalog)).toEqual(['Leche Gloria']);
        expect(suggestProducts('GLORIA', catalog)).toEqual(['Leche Gloria']);
        expect(suggestProducts('laive', catalog)).toEqual(['Yogurt Laive']);
    });

    it('prioriza las coincidencias al inicio', () => {
        expect(suggestProducts('p', catalog)).toEqual(['Pan de molde Bimbo', 'Jugo Pura Vida']);
    });

    it('no sugiere el nombre escrito exactamente', () => {
        expect(suggestProducts('Leche Gloria', catalog)).toEqual([]);
    });

    it('devuelve vacío con texto vacío y respeta el límite', () => {
        expect(suggestProducts('   ', catalog)).toEqual([]);
        expect(suggestProducts('a', catalog, 1)).toHaveLength(1);
    });
});
