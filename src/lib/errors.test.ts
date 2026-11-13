import { describe, expect, it } from 'vitest';
import {
    errorCode,
    isConnectionError,
    isInvalidCredentials,
    isSessionExpired,
    technicalCode,
    toFriendlyMessage,
} from './errors';

describe('errorCode', () => {
    it('detecta los códigos elevados por la RPC', () => {
        expect(errorCode({ message: 'RESPONSIBLE_REQUIRED' })).toBe('RESPONSIBLE_REQUIRED');
        expect(errorCode({ message: 'ERROR: INVALID_QUANTITY (P0001)' })).toBe('INVALID_QUANTITY');
    });

    it('devuelve null cuando el error no es un código conocido', () => {
        expect(errorCode({ message: 'algo inesperado' })).toBeNull();
        expect(errorCode(null)).toBeNull();
    });
});

describe('isConnectionError', () => {
    it('reconoce fallos de red del navegador y de supabase-js', () => {
        expect(isConnectionError(new TypeError('Failed to fetch'))).toBe(true);
        expect(isConnectionError({ message: 'NetworkError when attempting to fetch resource.' })).toBe(
            true,
        );
        expect(isConnectionError({ message: 'duplicate key value' })).toBe(false);
    });
});

describe('isInvalidCredentials', () => {
    it('reconoce credenciales inválidas de Supabase Auth', () => {
        expect(isInvalidCredentials({ message: 'Invalid login credentials' })).toBe(true);
        expect(isInvalidCredentials({ message: 'Email not confirmed' })).toBe(false);
    });
});

describe('toFriendlyMessage', () => {
    it.each([
        ['RESPONSIBLE_REQUIRED', 'Ingresa el nombre del encargado.'],
        ['PRODUCT_REQUIRED', 'Ingresa el nombre del producto.'],
        ['INVALID_QUANTITY', 'La cantidad debe ser mayor que cero.'],
        ['INVALID_DATE', 'Selecciona una fecha de vencimiento válida.'],
        ['ROWS_REQUIRED', 'Agrega al menos un producto antes de guardar.'],
    ])('traduce el código %s a un mensaje entendible', (code, expected) => {
        expect(toFriendlyMessage({ message: code })).toBe(expected);
    });

    it('explica los problemas de conexión sin tecnicismos', () => {
        expect(toFriendlyMessage(new TypeError('Failed to fetch'))).toContain('conexión');
    });

    it('traduce credenciales inválidas', () => {
        expect(toFriendlyMessage({ message: 'Invalid login credentials' })).toBe(
            'Correo o contraseña incorrectos.',
        );
    });

    it('usa un mensaje genérico y nunca filtra detalles técnicos', () => {
        const message = toFriendlyMessage({
            message: 'duplicate key value violates unique constraint "products_normalized_name_key"',
        });
        expect(message).toBe('No se pudo completar la operación. Inténtalo nuevamente.');
        expect(message).not.toMatch(/constraint|key|violates/i);
    });

    it('tolera errores lanzados como texto', () => {
        expect(toFriendlyMessage('PRODUCT_REQUIRED')).toBe('Ingresa el nombre del producto.');
    });
});

describe('errores de Supabase', () => {
    it('explica que faltan migraciones cuando no existe la función', () => {
        const message = toFriendlyMessage({
            code: 'PGRST202',
            message: 'Could not find the function public.register_batches',
        });

        expect(message).toContain('migraciones');
    });

    it('explica que falta una tabla', () => {
        const message = toFriendlyMessage({
            code: 'PGRST205',
            message: "Could not find the table 'public.product_batches'",
        });

        expect(message).toContain('Faltan tablas');
    });

    it('explica los problemas de permisos', () => {
        expect(
            toFriendlyMessage({ code: '42501', message: 'permission denied for table products' }),
        ).toContain('permiso');
        expect(
            toFriendlyMessage({
                message: 'new row violates row-level security policy for table "products"',
            }),
        ).toContain('permiso');
    });

    it('detecta y explica la sesión caducada', () => {
        expect(isSessionExpired({ code: 'PGRST301', message: 'JWT expired' })).toBe(true);
        expect(isSessionExpired({ message: 'JWT expired' })).toBe(true);
        expect(toFriendlyMessage({ code: 'PGRST301', message: 'JWT expired' })).toContain(
            'sesión caducó',
        );
    });

    it('añade una referencia corta cuando el error es desconocido', () => {
        const message = toFriendlyMessage({ code: 'XX000', message: 'algo raro' });

        expect(message).toContain('ref: XX000');
        expect(message).not.toContain('algo raro');
    });

    it('extrae el código técnico cuando existe', () => {
        expect(technicalCode({ code: 'PGRST202' })).toBe('PGRST202');
        expect(technicalCode({ message: 'sin código' })).toBeNull();
    });
});
