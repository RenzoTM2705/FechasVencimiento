import { describe, expect, it } from 'vitest';
import { errorCode, isConnectionError, isInvalidCredentials, toFriendlyMessage } from './errors';

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
