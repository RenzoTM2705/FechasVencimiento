/**
 * Traducción de errores técnicos a mensajes comprensibles para el usuario final.
 *
 * Las RPC elevan excepciones con códigos estables (`RESPONSIBLE_REQUIRED`,
 * `INVALID_QUANTITY`, …) y PostgREST/Supabase devuelven códigos propios
 * (`PGRST202`, `42501`, …). Aquí se traducen a español y, cuando el caso no se
 * reconoce, se añade una referencia corta para poder diagnosticarlo sin
 * exponer detalles internos.
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

/** Códigos de PostgREST/Postgres que sí podemos explicar. */
const CODE_MESSAGES: Record<string, string> = {
    PGRST202:
        'La base de datos no tiene la función de guardado. Revisa que las migraciones estén aplicadas en el proyecto correcto.',
    PGRST203:
        'La base de datos no tiene la función de guardado. Revisa que las migraciones estén aplicadas en el proyecto correcto.',
    PGRST205:
        'Faltan tablas en la base de datos. Revisa que las migraciones estén aplicadas en el proyecto correcto.',
    PGRST301: 'Tu sesión caducó. Cierra sesión y vuelve a entrar.',
    PGRST302: 'Tu sesión caducó. Cierra sesión y vuelve a entrar.',
    '42501': 'Tu usuario no tiene permiso para esta acción. Revisa las políticas de la base de datos.',
    '23514': 'Alguno de los datos no cumple las reglas de la base de datos.',
    '23503': 'El registro hace referencia a un dato que ya no existe.',
    '23505': 'Ya existe un registro con esos datos.',
};

const CONNECTION_MESSAGES = ['failed to fetch', 'networkerror', 'network request failed', 'load failed'];

const SESSION_MESSAGES = ['jwt expired', 'invalid jwt', 'jwt is expired', 'token has expired', 'auth session missing'];

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

/** Nombre del error (`TypeError`, `AuthSessionMissingError`, …). */
function nameOf(error: unknown): string | null {
    if (error && typeof error === 'object' && 'name' in error) {
        const value = (error as { name?: unknown }).name;
        if (typeof value === 'string' && value !== '' && value !== 'Error') return value;
    }
    return null;
}

/** Código devuelto por PostgREST/Postgres, si existe. */
export function technicalCode(error: unknown): string | null {
    if (error && typeof error === 'object' && 'code' in error) {
        const value = (error as { code?: unknown }).code;
        if (typeof value === 'string' && value !== '') return value;
    }
    return null;
}

/** Códigos de negocio elevados por las RPC. */
export function errorCode(error: unknown): string | null {
    const message = messageOf(error);
    const found = Object.keys(ERROR_MESSAGES).find((code) => message.includes(code));
    return found ?? null;
}

export function isConnectionError(error: unknown): boolean {
    const message = messageOf(error).toLowerCase();
    return CONNECTION_MESSAGES.some((fragment) => message.includes(fragment));
}

export function isSessionExpired(error: unknown): boolean {
    const code = technicalCode(error);
    if (code === 'PGRST301' || code === 'PGRST302') return true;

    const message = messageOf(error).toLowerCase();
    if (SESSION_MESSAGES.some((fragment) => message.includes(fragment))) return true;

    return nameOf(error) === 'AuthSessionMissingError';
}

export function isInvalidCredentials(error: unknown): boolean {
    const message = messageOf(error).toLowerCase();
    return INVALID_CREDENTIALS.some((fragment) => message.includes(fragment));
}

/**
 * Mensaje listo para mostrar en la interfaz. Si el caso no se reconoce, añade
 * una referencia corta (`ref: PGRST202`) para poder diagnosticarlo.
 */
export function toFriendlyMessage(error: unknown): string {
    const code = errorCode(error);
    if (code) return ERROR_MESSAGES[code];

    const technical = technicalCode(error);
    if (technical && CODE_MESSAGES[technical]) return CODE_MESSAGES[technical];

    if (isSessionExpired(error)) {
        return 'Tu sesión caducó. Cierra sesión y vuelve a entrar.';
    }

    if (isConnectionError(error)) {
        return 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo nuevamente.';
    }

    if (isInvalidCredentials(error)) {
        return 'Correo o contraseña incorrectos.';
    }

    const message = messageOf(error).toLowerCase();
    if (message.includes('row-level security')) {
        return 'Tu usuario no tiene permiso para esta acción. Revisa las políticas de la base de datos.';
    }

    const reference = technical ?? nameOf(error);
    return reference ? `${FALLBACK} (ref: ${reference})` : FALLBACK;
}
