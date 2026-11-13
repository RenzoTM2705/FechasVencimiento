import type { BatchFilters, BatchView, Indicators } from '@/types/domain';
import { normalizeText } from './text';

export const DEFAULT_FILTERS: BatchFilters = {
    search: '',
    productId: null,
    responsible: null,
    dateExact: null,
    dateFrom: null,
    dateTo: null,
    dueWithinDays: null,
    statuses: [],
    sort: 'expiration_asc',
};

const collator = new Intl.Collator('es');

function compare(a: BatchView, b: BatchView, sort: BatchFilters['sort']): number {
    switch (sort) {
        case 'expiration_asc':
            return (
                a.expirationDate.localeCompare(b.expirationDate) ||
                collator.compare(a.productName, b.productName)
            );
        case 'expiration_desc':
            return (
                b.expirationDate.localeCompare(a.expirationDate) ||
                collator.compare(a.productName, b.productName)
            );
        case 'quantity_asc':
            return a.quantity - b.quantity || a.daysRemaining - b.daysRemaining;
        case 'quantity_desc':
            return b.quantity - a.quantity || a.daysRemaining - b.daysRemaining;
        case 'product_asc':
            return (
                collator.compare(a.productName, b.productName) ||
                a.daysRemaining - b.daysRemaining
            );
        default:
            return 0;
    }
}

/**
 * Aplica los filtros combinables (AND entre categorías, OR dentro de estados)
 * y devuelve los registros ordenados. No muta la entrada.
 */
export function applyFilters(batches: BatchView[], filters: BatchFilters): BatchView[] {
    const search = normalizeText(filters.search);
    const statuses = new Set(filters.statuses);

    const filtered = batches.filter((batch) => {
        if (search && !normalizeText(batch.productName).includes(search)) return false;
        if (filters.productId && batch.productId !== filters.productId) return false;
        if (filters.responsible && batch.responsibleName !== filters.responsible) return false;
        if (filters.dateExact && batch.expirationDate !== filters.dateExact) return false;
        if (filters.dateFrom && batch.expirationDate < filters.dateFrom) return false;
        if (filters.dateTo && batch.expirationDate > filters.dateTo) return false;
        if (
            filters.dueWithinDays !== null &&
            !(batch.daysRemaining >= 0 && batch.daysRemaining <= filters.dueWithinDays)
        ) {
            return false;
        }
        if (statuses.size > 0 && !statuses.has(batch.status)) return false;
        return true;
    });

    return filtered.sort((a, b) => compare(a, b, filters.sort));
}

/** Indicadores globales: cuentan registros, nunca cantidades. */
export function computeIndicators(batches: BatchView[]): Indicators {
    let dueSoon = 0;
    let dueToday = 0;
    let expired = 0;

    for (const batch of batches) {
        if (batch.daysRemaining < 0) expired += 1;
        else if (batch.daysRemaining === 0) dueToday += 1;
        else if (batch.daysRemaining <= 21) dueSoon += 1;
    }

    return { total: batches.length, dueSoon, dueToday, expired };
}

/** ¿Hay algún filtro activo distinto del orden? */
export function hasActiveFilters(filters: BatchFilters): boolean {
    return (
        filters.search.trim() !== '' ||
        filters.productId !== null ||
        filters.responsible !== null ||
        filters.dateExact !== null ||
        filters.dateFrom !== null ||
        filters.dateTo !== null ||
        filters.dueWithinDays !== null ||
        filters.statuses.length > 0
    );
}

/** Opciones de encargado presentes en los datos, ordenadas alfabéticamente. */
export function responsibleOptions(batches: BatchView[]): string[] {
    return [...new Set(batches.map((batch) => batch.responsibleName))].sort(collator.compare);
}

/** Activa o desactiva un estado en el filtro múltiple, conservando el orden. */
export function toggleStatus(
    statuses: BatchFilters['statuses'],
    status: BatchFilters['statuses'][number],
): BatchFilters['statuses'] {
    return statuses.includes(status)
        ? statuses.filter((item) => item !== status)
        : [...statuses, status];
}

/** Número de filtros activos (el orden no cuenta), para el indicador del botón. */
export function activeFilterCount(filters: BatchFilters): number {
    let count = 0;
    if (filters.search.trim() !== '') count += 1;
    if (filters.productId !== null) count += 1;
    if (filters.responsible !== null) count += 1;
    if (filters.dateExact !== null) count += 1;
    if (filters.dateFrom !== null) count += 1;
    if (filters.dateTo !== null) count += 1;
    if (filters.dueWithinDays !== null) count += 1;
    if (filters.statuses.length > 0) count += 1;
    return count;
}
