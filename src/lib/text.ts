/**
 * Normalización de texto para búsquedas y comparaciones de catálogo.
 *
 * Debe producir el mismo resultado que `public.normalize_product_name` en
 * PostgreSQL: minúsculas, sin acentos latinos, sin espacios sobrantes.
 * Se evita `String.prototype.normalize` incompleto: NFD + eliminación de
 * diacríticos cubre el español y la mayoría del latin-1.
 */
export function normalizeText(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ');
}
