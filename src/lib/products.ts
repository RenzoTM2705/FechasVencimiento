import type { BatchView } from '@/types/domain';
import { normalizeText } from './text';

const collator = new Intl.Collator('es');

/** Nombres de producto únicos presentes en los registros, ordenados alfabéticamente. */
export function uniqueProductNames(batches: BatchView[]): string[] {
    const names = new Map<string, string>();

    for (const batch of batches) {
        const key = normalizeText(batch.productName);
        if (!names.has(key)) names.set(key, batch.productName);
    }

    return [...names.values()].sort(collator.compare);
}

/**
 * Sugerencias de autocompletado: coincidencias por inclusión, sin distinguir
 * mayúsculas ni acentos, priorizando las que empiezan por el texto escrito.
 */
export function suggestProducts(query: string, catalog: string[], limit = 6): string[] {
    const needle = normalizeText(query);
    if (needle === '') return [];

    const startsWith: string[] = [];
    const contains: string[] = [];

    for (const name of catalog) {
        const normalized = normalizeText(name);
        if (normalized === needle) continue;
        if (normalized.startsWith(needle)) startsWith.push(name);
        else if (normalized.includes(needle)) contains.push(name);
    }

    startsWith.sort(collator.compare);
    contains.sort(collator.compare);

    return [...startsWith, ...contains].slice(0, limit);
}
