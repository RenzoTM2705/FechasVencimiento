import type { BatchView } from '@/types/domain';
import { daysRemaining, statusFor } from '@/lib/expiry';
import { getSupabase } from '@/lib/supabase';
import { technicalCode } from '@/lib/errors';
import { ensureFreshSession } from '@/features/auth/auth-store';
import type { BatchesService, NewBatch } from './batches-service';

interface ProductRelation {
    name: string;
}

interface BatchRow {
    id: string;
    product_id: string;
    responsible_name: string;
    quantity: number;
    expiration_date: string;
    created_at: string;
    updated_at: string;
    // PostgREST devuelve el recurso embebido como objeto (FK simple) o como
    // array según la inferencia de la relación; se aceptan ambas formas.
    products: ProductRelation | ProductRelation[] | null;
}

function productNameOf(relation: BatchRow['products']): string {
    if (!relation) return '';
    if (Array.isArray(relation)) return relation[0]?.name ?? '';
    return relation.name;
}

function toView(row: BatchRow, today: Date): BatchView {
    const days = daysRemaining(row.expiration_date, today);

    return {
        id: row.id,
        productId: row.product_id,
        productName: productNameOf(row.products),
        responsibleName: row.responsible_name,
        quantity: row.quantity,
        expirationDate: row.expiration_date,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        daysRemaining: days,
        status: statusFor(days),
    };
}

/**
 * Firma tipada a mano de la RPC.
 *
 * Los tipos generados de `Database` describen la función, pero la inferencia
 * de argumentos de postgrest-js exige coincidencia exacta y la resuelve como
 * `undefined` con tipos escritos a mano. Se declara la firma explícita para
 * conservar el nombre y los argumentos verificados.
 */
interface RegisterBatchesResult {
    data: number | null;
    error: { message: string } | null;
}

type RegisterBatchesRpc = (
    fn: 'register_batches',
    args: { p_responsible: string; p_rows: Record<string, unknown>[] },
) => PromiseLike<RegisterBatchesResult>;

interface UpdateBatchRpcResult {
    data: null;
    error: { message: string } | null;
}

type UpdateBatchRpc = (
    fn: 'update_batch',
    args: {
        p_id: string;
        p_responsible: string;
        p_product_name: string;
        p_quantity: number;
        p_expiration_date: string;
    },
) => PromiseLike<UpdateBatchRpcResult>;

function fail(error: unknown): never {
    // Traza útil para soporte; el usuario ve el mensaje traducido.
    console.error('[supabase]', error);
    throw error;
}

/**
 * Si el token caducó (`PGRST301`), intenta refrescar la sesión una vez y
 * repite la operación. Si el refresco no es posible (token inválido por
 * rotación de claves), devuelve el error original y el store cierra la sesión.
 */
async function withAuthRetry<T extends { error: { message: string } | null }>(
    run: () => PromiseLike<T>,
): Promise<T> {
    const first = await run();
    if (!first.error || technicalCode(first.error) !== 'PGRST301') return first;

    try {
        const { error: refreshError } = await getSupabase().auth.refreshSession();
        if (refreshError) return first;
    } catch {
        return first;
    }

    return run();
}

/**
 * Implementación real contra Supabase.
 *
 * - Lectura: `product_batches` con el nombre del producto embebido.
 * - Escritura: RPC `register_batches` / `update_batch` (transaccionales, con RLS activa) y borrado directo.
 */
export function createSupabaseBatchesService(): BatchesService {
    return {
        async list() {
            const { data, error } = await getSupabase()
                .from('product_batches')
                .select(
                    'id, product_id, responsible_name, quantity, expiration_date, created_at, updated_at, products(name)',
                )
                .order('expiration_date', { ascending: true });

            if (error) fail(error);

            const today = new Date();
            return ((data ?? []) as unknown as BatchRow[]).map((row) => toView(row, today));
        },

        async createMany(inputs: NewBatch[]) {
            if (inputs.length === 0) return 0;

            await ensureFreshSession();

            const responsible = inputs[0].responsibleName;
            if (inputs.some((input) => input.responsibleName !== responsible)) {
                throw new Error('MIXED_RESPONSIBLE');
            }

            // `rpc` usa `this.rest`: hay que conservar el contexto del cliente.
            const client = getSupabase();
            const rpc = client.rpc.bind(client) as unknown as RegisterBatchesRpc;
            const { data, error } = await withAuthRetry(() =>
                rpc('register_batches', {
                    p_responsible: responsible,
                    p_rows: inputs.map((input) => ({
                        product_name: input.productName,
                        quantity: input.quantity,
                        expiration_date: input.expirationDate,
                    })),
                }),
            );

            if (error) fail(error);

            return typeof data === 'number' ? data : inputs.length;
        },

        async update(batch) {
            await ensureFreshSession();

            // `rpc` usa `this.rest`: hay que conservar el contexto del cliente.
            const client = getSupabase();
            const rpc = client.rpc.bind(client) as unknown as UpdateBatchRpc;
            const { error } = await withAuthRetry(() =>
                rpc('update_batch', {
                    p_id: batch.id,
                    p_responsible: batch.responsibleName,
                    p_product_name: batch.productName,
                    p_quantity: batch.quantity,
                    p_expiration_date: batch.expirationDate,
                }),
            );

            if (error) fail(error);
        },

        async remove(id) {
            await ensureFreshSession();

            const { error } = await withAuthRetry(() =>
                getSupabase().from('product_batches').delete().eq('id', id),
            );

            if (error) fail(error);
        },
    };
}
