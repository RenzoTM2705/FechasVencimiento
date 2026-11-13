import { describe, expect, it } from 'vitest';
import {
    daysRemaining,
    describeDays,
    needsImmediateRemoval,
    parseIsoDate,
    statusFor,
    toIsoDate,
} from './expiry';

/** 13 de noviembre de 2026, 15:30 hora local. */
const TODAY = new Date(2026, 10, 13, 15, 30);

describe('daysRemaining', () => {
    it('cuenta días de calendario y admite fechas pasadas', () => {
        expect(daysRemaining('2026-11-13', TODAY)).toBe(0);
        expect(daysRemaining('2026-11-14', TODAY)).toBe(1);
        expect(daysRemaining('2026-12-05', TODAY)).toBe(22);
        expect(daysRemaining('2026-11-12', TODAY)).toBe(-1);
        expect(daysRemaining('2026-11-03', TODAY)).toBe(-10);
    });

    it('no depende de la hora del día', () => {
        const early = new Date(2026, 10, 13, 0, 5);
        const late = new Date(2026, 10, 13, 23, 55);

        expect(daysRemaining('2026-11-20', early)).toBe(7);
        expect(daysRemaining('2026-11-20', late)).toBe(7);
    });

    it('cruza correctamente fin de mes y fin de año', () => {
        expect(daysRemaining('2026-12-01', new Date(2026, 10, 30, 12))).toBe(1);
        expect(daysRemaining('2027-01-01', new Date(2026, 11, 31, 12))).toBe(1);
    });

    it('rechaza formatos y fechas inexistentes', () => {
        expect(() => daysRemaining('20/11/2026', TODAY)).toThrow(RangeError);
        expect(() => daysRemaining('2026-02-30', TODAY)).toThrow(RangeError);
    });
});

describe('statusFor (umbrales aprobados)', () => {
    it.each([
        [22, 'vigente'],
        [21, 'proximo'],
        [11, 'proximo'],
        [10, 'critico'],
        [1, 'critico'],
        [0, 'vence_hoy'],
        [-1, 'vencido'],
        [-30, 'vencido'],
    ])('%i días → %s', (days, expected) => {
        expect(statusFor(days)).toBe(expected);
    });
});

describe('describeDays', () => {
    it.each([
        [0, 'Vence hoy'],
        [1, '1 día'],
        [12, '12 días'],
        [-1, 'Venció hace 1 día'],
        [-3, 'Venció hace 3 días'],
    ])('%i → %s', (days, expected) => {
        expect(describeDays(days)).toBe(expected);
    });
});

describe('needsImmediateRemoval', () => {
    it('solo exige retiro cuando la fecha se cumplió', () => {
        expect(needsImmediateRemoval(0)).toBe(true);
        expect(needsImmediateRemoval(-1)).toBe(true);
        expect(needsImmediateRemoval(1)).toBe(false);
    });
});

describe('parseIsoDate / toIsoDate', () => {
    it('convierte sin desfase de zona horaria', () => {
        expect(parseIsoDate('2026-11-13')).toEqual({ year: 2026, month: 11, day: 13 });
        expect(toIsoDate(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
    });
});
