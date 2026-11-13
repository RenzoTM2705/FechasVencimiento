import { parseIsoDate } from './expiry';

/** Límites alineados con los `check` de la base de datos. */
export const LIMITS = {
    responsible: 80,
    product: 120,
    quantity: 99_999,
} as const;

export interface BatchDraft {
    responsibleName: string;
    productName: string;
    quantity: string;
    expirationDate: string;
}

export type BatchField = keyof BatchDraft;

export type FieldErrors = Partial<Record<BatchField, string>>;

export interface ValidatedBatch {
    responsibleName: string;
    productName: string;
    quantity: number;
    expirationDate: string;
}

export interface ValidationResult {
    errors: FieldErrors;
    value: ValidatedBatch | null;
}

function validateResponsible(raw: string): string | null {
    const value = raw.trim();
    if (value === '') return 'Ingresa el nombre del encargado.';
    if (value.length > LIMITS.responsible) {
        return `El encargado no puede superar ${LIMITS.responsible} caracteres.`;
    }
    return null;
}

function validateProduct(raw: string): string | null {
    const value = raw.trim();
    if (value === '') return 'Ingresa el nombre del producto.';
    if (value.length > LIMITS.product) {
        return `El producto no puede superar ${LIMITS.product} caracteres.`;
    }
    return null;
}

function validateQuantity(raw: string): string | null {
    const value = raw.trim();
    if (value === '') return 'Ingresa la cantidad.';
    if (!/^\d+$/.test(value)) return 'La cantidad debe ser un número entero.';

    const quantity = Number(value);
    if (quantity <= 0) return 'La cantidad debe ser mayor que cero.';
    if (quantity > LIMITS.quantity) return `La cantidad no puede superar ${LIMITS.quantity}.`;
    return null;
}

function validateExpiration(raw: string): string | null {
    if (raw.trim() === '') return 'Selecciona una fecha de vencimiento.';

    try {
        parseIsoDate(raw);
        return null;
    } catch {
        return 'Selecciona una fecha de vencimiento válida.';
    }
}

/** Valida un registro individual y devuelve el valor listo para guardar. */
export function validateBatch(draft: BatchDraft): ValidationResult {
    const errors: FieldErrors = {};

    const responsible = validateResponsible(draft.responsibleName);
    if (responsible) errors.responsibleName = responsible;

    const product = validateProduct(draft.productName);
    if (product) errors.productName = product;

    const quantity = validateQuantity(draft.quantity);
    if (quantity) errors.quantity = quantity;

    const expiration = validateExpiration(draft.expirationDate);
    if (expiration) errors.expirationDate = expiration;

    if (Object.keys(errors).length > 0) {
        return { errors, value: null };
    }

    return {
        errors,
        value: {
            responsibleName: draft.responsibleName.trim(),
            productName: draft.productName.trim(),
            quantity: Number(draft.quantity.trim()),
            expirationDate: draft.expirationDate,
        },
    };
}

export interface BulkDraftRow {
    id: string;
    productName: string;
    quantity: string;
    expirationDate: string;
}

export interface BulkValidationResult {
    responsibleError: string | null;
    rowErrors: Record<string, FieldErrors>;
    values: ValidatedBatch[] | null;
}

/**
 * Valida el alta grupal completa. Ninguna fila se guarda si alguna falla:
 * el llamador recibe los errores por fila y no debe enviar nada.
 */
export function validateBulk(
    responsibleName: string,
    rows: BulkDraftRow[],
): BulkValidationResult {
    const responsibleError = validateResponsible(responsibleName);
    const rowErrors: Record<string, FieldErrors> = {};
    const values: ValidatedBatch[] = [];

    for (const row of rows) {
        const result = validateBatch({
            responsibleName,
            productName: row.productName,
            quantity: row.quantity,
            expirationDate: row.expirationDate,
        });

        if (result.value) {
            values.push(result.value);
        } else {
            rowErrors[row.id] = result.errors;
        }
    }

    if (responsibleError || Object.keys(rowErrors).length > 0) {
        return { responsibleError, rowErrors, values: null };
    }

    return { responsibleError: null, rowErrors, values };
}
