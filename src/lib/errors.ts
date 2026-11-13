/**
 * Traducción de errores técnicos a mensajes comprensibles para el usuario final.
 *
 * La RPC `register_batches` eleva excepciones con códigos estables
 * (`RESPONSIBLE_REQUIRED`, `INVALID_QUANTITY`, …). Aquí se mapean a español y se
 * evita mostrar detalles internos de Postgres o Supabase.
 */

const ERROR_MESSAGES: Record<string, string> = {
    RESPONSIBLE_REQUIRED: 'Ingresa el nombre del encargado.',
    PRODUCT_REQUIRED: 'Ingresa el nombre del producto.',
    INVALID_QUANTITY: 'La cantidad debe ser mayor que cero.',
    INVALID_DATE: 'Selecciona una fecha de vencimiento válida.',
    ROWS_REQUIRED: 'Agrega al menos un producto antes de guardar.',
    PRODUCT_NAME_REQUIRED: 'Ingresa el nombre del producto.',
    RESPONSIBLE_TOO_LONG: 'El nombre del encargado no puede superar 80 caracteres.',
    PRODUCT_TOO_LONG: 'El nombre del producto no puede superar 120 caracteres.',
    MIXED_RESPONSIBLE: 'Todos los productos de una operación deben tener el mismo encargado.',
    BATCH_NOT_FOUND: 'El registro ya no existe. Actualiza la página e inténtalo nuevamente.',
};

const CONNECTION_MESSAGES = ['failed to fetch', 'networkerror', 'network request failed', 'load failed'];

const INVALID_CREDENTIALS = ['invalid login credentials', 'invalid_grant'];

const FALLBACK = 'No se pudo completar la operación. Inténtalo nuevamente.';

function messageOf(error: unknown): string {
    if (typeof error === 'string') return error;
    if (error && typeof error === 'object' && 'message' in error) {
        const value = (error as { message?: unknown }).message;
        if (typeof value === 'string') return value;
    }
    return '';
}

/** Códigos conocidos elevados por la base de datos. */
export function errorCode(error: unknown): string | null {
    const message = messageOf(error);
    const found = Object.keys(ERROR_MESSAGES).find((code) => message.includes(code));
    return found ?? null;
}

export function isConnectionError(error: unknown): boolean {
    const message = messageOf(error).toLowerCase();
    return CONNECTION_MESSAGES.some((fragment) => message.includes(fragment));
}

export function isInvalidCredentials(error: unknown): boolean {
    const message = messageOf(error).toLowerCase();
    return INVALID_CREDENTIALS.some((fragment) => message.includes(fragment));
}

/** Mensaje listo para mostrar en la interfaz. */
export function toFriendlyMessage(error: unknown): string {
    const code = errorCode(error);
    if (code) return ERROR_MESSAGES[code];

    if (isConnectionError(error)) {
        return 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo nuevamente.';
    }

    if (isInvalidCredentials(error)) {
        return 'Correo o contraseña incorrectos.';
    }

    return FALLBACK;
}
