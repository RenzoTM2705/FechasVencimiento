import { parseIsoDate } from './expiry';

const dateFormatter = new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
});

const shortDateFormatter = new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
});

const longDateFormatter = new Intl.DateTimeFormat('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});

const numberFormatter = new Intl.NumberFormat('es-PE');

/** `2026-11-20` → `20/11/2026` (sin desfase de zona horaria). */
export function formatDate(value: string): string {
    const { year, month, day } = parseIsoDate(value);
    return dateFormatter.format(new Date(year, month - 1, day));
}

/** `2026-11-20` → `20 nov` */
export function formatShortDate(value: string): string {
    const { year, month, day } = parseIsoDate(value);
    return shortDateFormatter.format(new Date(year, month - 1, day)).replace('.', '');
}

/** `jueves, 13 de noviembre de 2026` */
export function formatLongDate(date: Date = new Date()): string {
    return longDateFormatter.format(date);
}

export function formatNumber(value: number): string {
    return numberFormatter.format(value);
}

/** Texto de cantidad: `1 unidad` / `12 unidades`. */
export function formatUnits(value: number): string {
    return value === 1 ? '1 unidad' : `${formatNumber(value)} unidades`;
}
