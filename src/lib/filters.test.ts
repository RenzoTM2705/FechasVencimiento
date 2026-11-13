import { describe, expect, it } from 'vitest';
import { makeBatch } from '@/test/factories';
import type { BatchFilters } from '@/types/domain';
import {
    DEFAULT_FILTERS,
    activeFilterCount,
    applyFilters,
    computeIndicators,
    hasActiveFilters,
    responsibleOptions,
    toggleStatus,
} from './filters';

const BATCHES = [
    makeBatch({
        productId: 'p-leche',
        productName: 'Leche Gloria',
        responsibleName: 'Carlos',
        quantity: 10,
        daysRemaining: 5,
    }),
    makeBatch({
        productId: 'p-leche',
        productName: 'Leche Gloria',
        responsibleName: 'María',
        quantity: 2,
        daysRemaining: -2,
    }),
    makeBatch({
        productId: 'p-yogurt',
        productName: 'Yogurt Laive',
        responsibleName: 'María',
        quantity: 20,
        daysRemaining: 0,
    }),
    makeBatch({
        productId: 'p-queso',
        productName: 'Queso fresco',
        responsibleName: 'Carlos',
        quantity: 7,
        daysRemaining: 30,
    }),
];

describe('applyFilters', () => {
    it('sin filtros devuelve todo ordenado por vencimiento', () => {
        const result = applyFilters(BATCHES, DEFAULT_FILTERS);
        expect(result).toHaveLength(4);
        expect(result.map((batch) => batch.daysRemaining)).toEqual([-2, 0, 5, 30]);
    });

    it('busca por producto sin distinguir mayúsculas ni acentos', () => {
        expect(applyFilters(BATCHES, { ...DEFAULT_FILTERS, search: 'LECHE' })).toHaveLength(2);
        expect(applyFilters(BATCHES, { ...DEFAULT_FILTERS, search: 'leche gloria' })).toHaveLength(
            2,
        );
    });

    it('combina encargado y estado', () => {
        const result = applyFilters(BATCHES, {
            ...DEFAULT_FILTERS,
            responsible: 'María',
            statuses: ['vencido'],
        });

        expect(result).toHaveLength(1);
        expect(result[0].productName).toBe('Leche Gloria');
        expect(result[0].responsibleName).toBe('María');
    });

    it('«próximos N días» incluye hoy y excluye lo ya vencido', () => {
        const result = applyFilters(BATCHES, { ...DEFAULT_FILTERS, dueWithinDays: 7 });

        expect(result.map((batch) => batch.daysRemaining)).toEqual([0, 5]);
    });

    it('filtra por rango de fechas inclusivo', () => {
        const result = applyFilters(BATCHES, {
            ...DEFAULT_FILTERS,
            dateFrom: '2026-11-13',
            dateTo: '2026-11-18',
        });

        expect(result.map((batch) => batch.daysRemaining)).toEqual([0, 5]);
    });

    it('filtra por fecha exacta', () => {
        const result = applyFilters(BATCHES, {
            ...DEFAULT_FILTERS,
            dateExact: '2026-11-11',
        });

        expect(result).toHaveLength(1);
        expect(result[0].daysRemaining).toBe(-2);
    });

    it('ordena por cantidad ascendente y descendente', () => {
        const asc = applyFilters(BATCHES, { ...DEFAULT_FILTERS, sort: 'quantity_asc' });
        const desc = applyFilters(BATCHES, { ...DEFAULT_FILTERS, sort: 'quantity_desc' });

        expect(asc.map((batch) => batch.quantity)).toEqual([2, 7, 10, 20]);
        expect(desc.map((batch) => batch.quantity)).toEqual([20, 10, 7, 2]);
    });

    it('ordena por nombre de producto', () => {
        const result = applyFilters(BATCHES, { ...DEFAULT_FILTERS, sort: 'product_asc' });
        expect(result.map((batch) => batch.productName)).toEqual([
            'Leche Gloria',
            'Leche Gloria',
            'Queso fresco',
            'Yogurt Laive',
        ]);
    });

    it('no muta el arreglo original', () => {
        const snapshot = BATCHES.map((batch) => batch.id);
        applyFilters(BATCHES, { ...DEFAULT_FILTERS, sort: 'quantity_desc' });
        expect(BATCHES.map((batch) => batch.id)).toEqual(snapshot);
    });
});

describe('computeIndicators', () => {
    it('cuenta registros y no cantidades', () => {
        expect(computeIndicators(BATCHES)).toEqual({ total: 4, dueSoon: 1, dueToday: 1, expired: 1 });
    });

    it('con datos vacíos devuelve ceros', () => {
        expect(computeIndicators([])).toEqual({ total: 0, dueSoon: 0, dueToday: 0, expired: 0 });
    });
});

describe('hasActiveFilters', () => {
    it('ignora el orden y detecta el resto', () => {
        expect(hasActiveFilters(DEFAULT_FILTERS)).toBe(false);
        expect(hasActiveFilters({ ...DEFAULT_FILTERS, sort: 'product_asc' })).toBe(false);
        expect(hasActiveFilters({ ...DEFAULT_FILTERS, search: 'leche' })).toBe(true);
        expect(hasActiveFilters({ ...DEFAULT_FILTERS, statuses: ['vigente'] })).toBe(true);
    });
});

describe('responsibleOptions', () => {
    it('devuelve encargados únicos y ordenados', () => {
        expect(responsibleOptions(BATCHES)).toEqual(['Carlos', 'María']);
    });
});

describe('toggleStatus', () => {
    it('añade y quita estados conservando el orden', () => {
        expect(toggleStatus([], 'critico')).toEqual(['critico']);
        expect(toggleStatus(['critico'], 'vencido')).toEqual(['critico', 'vencido']);
        expect(toggleStatus(['critico', 'vencido'], 'critico')).toEqual(['vencido']);
    });

    it('no muta el arreglo original', () => {
        const original: BatchFilters['statuses'] = ['vigente'];
        toggleStatus(original, 'vencido');
        expect(original).toEqual(['vigente']);
    });
});

describe('activeFilterCount', () => {
    it('cuenta categorías activas sin contar el orden', () => {
        expect(activeFilterCount(DEFAULT_FILTERS)).toBe(0);
        expect(activeFilterCount({ ...DEFAULT_FILTERS, sort: 'product_asc' })).toBe(0);
        expect(activeFilterCount({ ...DEFAULT_FILTERS, search: 'leche' })).toBe(1);
        expect(
            activeFilterCount({
                ...DEFAULT_FILTERS,
                search: 'leche',
                statuses: ['critico'],
                dueWithinDays: 7,
            }),
        ).toBe(3);
    });

    it('cuenta el rango como dos filtros y la fecha exacta como uno', () => {
        expect(activeFilterCount({ ...DEFAULT_FILTERS, dateFrom: '2026-11-01' })).toBe(1);
        expect(
            activeFilterCount({
                ...DEFAULT_FILTERS,
                dateFrom: '2026-11-01',
                dateTo: '2026-11-30',
            }),
        ).toBe(2);
        expect(activeFilterCount({ ...DEFAULT_FILTERS, dateExact: '2026-11-13' })).toBe(1);
    });
});
