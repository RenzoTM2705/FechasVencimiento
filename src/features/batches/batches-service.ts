import type { BatchView } from '@/types/domain';

/** Registro listo para guardar (validado en el cliente y revalidado en la BD). */
export interface NewBatch {
    responsibleName: string;
    productName: string;
    quantity: number;
    expirationDate: string;
}

/**
 * Contrato del origen de datos.
 *
 * La interfaz de usuario solo conoce esta interfaz: la implementación real
 * (Supabase) y la de memoria son intercambiables. `createMany` es atómica en
 * ambas: o se guardan todos los registros o ninguno.
 */
export interface BatchesService {
    list(): Promise<BatchView[]>;
    createMany(inputs: NewBatch[]): Promise<number>;
    update(batch: UpdateBatch): Promise<void>;
    remove(id: string): Promise<void>;
}

/** Registro existente que se va a editar. */
export interface UpdateBatch extends NewBatch {
    id: string;
}
