import type { ExpiryStatus } from '@/types/domain';

/**
 * Cálculo de vencimientos. Única fuente de verdad: tabla, tarjetas,
 * indicadores, filtros y exportación consumen estas funciones.
 *
 * Se trabaja con fechas de calendario (`YYYY-MM-DD`) y se comparan en UTC,
 * de modo que el resultado no depende de la zona horaria del navegador ni
 * del cambio de horario de verano.
 */

const MS_PER_DAY = 86_400_000;

export const STATUS_LABELS: Record<ExpiryStatus, string> = {
    vigente: 'Vigente',
    proximo: 'Próximo a vencer',
    critico: 'Crítico',
    vence_hoy: 'Vence hoy',
    vencido: 'Vencido',
};

/** Umbrales aprobados en docs/PRD.md (RF-06). */
export const THRESHOLDS = {
    vigenteAfter: 21,
    proximoFrom: 11,
    proximoTo: 21,
    criticoFrom: 1,
    criticoTo: 10,
} as const;

interface DateParts {
    year: number;
    month: number;
    day: number;
}

function pad(value: number): string {
    return String(value).padStart(2, '0');
}

/** Fecha local de hoy expresada como `YYYY-MM-DD`. */
export function toIsoDate(date: Date): string {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Lee una fecha ISO `YYYY-MM-DD` sin pasar por `Date` (evita interpretar UTC). */
export function parseIsoDate(value: string): DateParts {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) {
        throw new RangeError(`Fecha inválida: "${value}". Se espera YYYY-MM-DD.`);
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const check = new Date(Date.UTC(year, month - 1, day));

    if (
        check.getUTCFullYear() !== year ||
        check.getUTCMonth() !== month - 1 ||
        check.getUTCDate() !== day
    ) {
        throw new RangeError(`Fecha inexistente: "${value}".`);
    }

    return { year, month, day };
}

function toUtcMs(parts: DateParts): number {
    return Date.UTC(parts.year, parts.month - 1, parts.day);
}

/** Días de calendario entre hoy y la fecha de vencimiento (puede ser negativo). */
export function daysRemaining(expirationDate: string, today: Date = new Date()): number {
    const target = toUtcMs(parseIsoDate(expirationDate));
    const base = toUtcMs({
        year: today.getFullYear(),
        month: today.getMonth() + 1,
        day: today.getDate(),
    });

    return Math.round((target - base) / MS_PER_DAY);
}

/** Estado según los umbrales aprobados. */
export function statusFor(days: number): ExpiryStatus {
    if (days > THRESHOLDS.vigenteAfter) return 'vigente';
    if (days >= THRESHOLDS.proximoFrom) return 'proximo';
    if (days >= THRESHOLDS.criticoFrom) return 'critico';
    if (days === 0) return 'vence_hoy';
    return 'vencido';
}

/** Texto legible de los días restantes. */
export function describeDays(days: number): string {
    if (days === 0) return 'Vence hoy';
    if (days === 1) return '1 día';
    if (days > 1) return `${days} días`;

    const elapsed = Math.abs(days);
    return elapsed === 1 ? 'Venció hace 1 día' : `Venció hace ${elapsed} días`;
}

/** Aviso obligatorio cuando la fecha ya se cumplió (0 días o vencido). */
export function needsImmediateRemoval(days: number): boolean {
    return days <= 0;
}
