/**
 * Tipos del dominio de la aplicación (independientes de la base de datos).
 */

/** Estado de vencimiento según los umbrales aprobados. */
export type ExpiryStatus = 'vigente' | 'proximo' | 'critico' | 'vence_hoy' | 'vencido';

/** Vista activa: tabla o tarjetas agrupadas. */
export type ViewMode = 'table' | 'cards';

/** Un registro de vencimiento ya unido a su producto y con días calculados. */
export interface BatchView {
    id: string;
    productId: string;
    productName: string;
    responsibleName: string;
    quantity: number;
    /** Fecha ISO `YYYY-MM-DD`. */
    expirationDate: string;
    createdAt: string;
    updatedAt: string;
    daysRemaining: number;
    status: ExpiryStatus;
}

/** Producto del catálogo (para autocompletado y filtros). */
export interface ProductOption {
    id: string;
    name: string;
}

/** Entrada del formulario, individual o una fila del alta grupal. */
export interface BatchInput {
    responsibleName: string;
    productName: string;
    quantity: number;
    expirationDate: string;
}

/** Filtros combinables de la barra superior. */
export interface BatchFilters {
    search: string;
    productId: string | null;
    responsible: string | null;
    dateExact: string | null;
    dateFrom: string | null;
    dateTo: string | null;
    dueWithinDays: 7 | 10 | 15 | 21 | 30 | null;
    statuses: ExpiryStatus[];
    sort:
        | 'expiration_asc'
        | 'expiration_desc'
        | 'quantity_asc'
        | 'quantity_desc'
        | 'product_asc';
}

/** Indicadores globales (independientes de los filtros). */
export interface Indicators {
    total: number;
    dueSoon: number;
    dueToday: number;
    expired: number;
}
