import { describe, expect, it } from 'vitest';
import { validateBatch, validateBulk, validateLogin, type BulkDraftRow } from './validation';

const VALID = {
    responsibleName: '  Carlos  ',
    productName: '  Leche Gloria ',
    quantity: '10',
    expirationDate: '2026-11-20',
};

function row(overrides: Partial<BulkDraftRow> = {}): BulkDraftRow {
    return {
        id: 'row-1',
        productName: 'Yogurt Laive',
        quantity: '5',
        expirationDate: '2026-12-01',
        ...overrides,
    };
}

describe('validateBatch', () => {
    it('acepta un registro completo y recorta espacios', () => {
        const result = validateBatch(VALID);

        expect(result.errors).toEqual({});
        expect(result.value).toEqual({
            responsibleName: 'Carlos',
            productName: 'Leche Gloria',
            quantity: 10,
            expirationDate: '2026-11-20',
        });
    });

    it('exige encargado y producto', () => {
        const result = validateBatch({ ...VALID, responsibleName: '   ', productName: '' });

        expect(result.value).toBeNull();
        expect(result.errors.responsibleName).toBe('Ingresa el nombre del encargado.');
        expect(result.errors.productName).toBe('Ingresa el nombre del producto.');
    });

    it('rechaza cantidades no enteras, cero o negativas', () => {
        expect(validateBatch({ ...VALID, quantity: '0' }).errors.quantity).toBe(
            'La cantidad debe ser mayor que cero.',
        );
        expect(validateBatch({ ...VALID, quantity: '-3' }).errors.quantity).toBe(
            'La cantidad debe ser un número entero.',
        );
        expect(validateBatch({ ...VALID, quantity: '1.5' }).errors.quantity).toBe(
            'La cantidad debe ser un número entero.',
        );
        expect(validateBatch({ ...VALID, quantity: 'abc' }).errors.quantity).toBe(
            'La cantidad debe ser un número entero.',
        );
        expect(validateBatch({ ...VALID, quantity: '' }).errors.quantity).toBe(
            'Ingresa la cantidad.',
        );
    });

    it('limita la cantidad máxima', () => {
        expect(validateBatch({ ...VALID, quantity: '100000' }).errors.quantity).toBe(
            'La cantidad no puede superar 99999.',
        );
    });

    it('exige una fecha válida e inexistente la rechaza', () => {
        expect(validateBatch({ ...VALID, expirationDate: '' }).errors.expirationDate).toBe(
            'Selecciona una fecha de vencimiento.',
        );
        expect(validateBatch({ ...VALID, expirationDate: '20/11/2026' }).errors.expirationDate).toBe(
            'Selecciona una fecha de vencimiento válida.',
        );
        expect(validateBatch({ ...VALID, expirationDate: '2026-02-30' }).errors.expirationDate).toBe(
            'Selecciona una fecha de vencimiento válida.',
        );
    });

    it('limita la longitud de encargado y producto', () => {
        expect(
            validateBatch({ ...VALID, responsibleName: 'x'.repeat(81) }).errors.responsibleName,
        ).toBe('El encargado no puede superar 80 caracteres.');
        expect(validateBatch({ ...VALID, productName: 'x'.repeat(121) }).errors.productName).toBe(
            'El producto no puede superar 120 caracteres.',
        );
    });
});

describe('validateLogin', () => {
    it('exige correo y contraseña', () => {
        expect(validateLogin({ email: '', password: '' })).toEqual({
            email: 'Ingresa tu correo.',
            password: 'Ingresa tu contraseña.',
        });
    });

    it('rechaza correos con formato inválido', () => {
        expect(validateLogin({ email: 'carlos', password: 'secreta' })).toEqual({
            email: 'Ingresa un correo válido.',
        });
    });

    it('acepta un correo válido', () => {
        expect(validateLogin({ email: ' admin@tienda.pe ', password: 'secreta' })).toEqual({});
    });
});

describe('validateBulk', () => {
    it('valida todas las filas y comparte el encargado', () => {
        const result = validateBulk('Carlos', [
            row({ id: 'a' }),
            row({ id: 'b', productName: 'Pan de molde Bimbo', quantity: '3' }),
        ]);

        expect(result.responsibleError).toBeNull();
        expect(result.rowErrors).toEqual({});
        expect(result.values).toHaveLength(2);
        expect(result.values?.every((value) => value.responsibleName === 'Carlos')).toBe(true);
    });

    it('no devuelve valores si una sola fila es inválida', () => {
        const result = validateBulk('Carlos', [
            row({ id: 'a' }),
            row({ id: 'b', quantity: '0' }),
        ]);

        expect(result.values).toBeNull();
        expect(result.rowErrors.b?.quantity).toBe('La cantidad debe ser mayor que cero.');
        expect(result.rowErrors.a).toBeUndefined();
    });

    it('exige el encargado aunque las filas sean válidas', () => {
        const result = validateBulk('   ', [row()]);

        expect(result.values).toBeNull();
        expect(result.responsibleError).toBe('Ingresa el nombre del encargado.');
    });
});
