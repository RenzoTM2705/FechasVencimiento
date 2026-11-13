import type { BatchView } from '@/types/domain';
import { daysRemaining, statusFor } from '@/lib/expiry';
import { getSupabase } from '@/lib/supabase';
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

/**
 * Implementación real contra Supabase.
 *
 * - Lectura: `product_batches` con el nombre del producto embebido.
 * - Escritura: RPC `register_batches`, transaccional y con RLS activa.
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

            if (error) throw error;

            const today = new Date();
            return ((data ?? []) as unknown as BatchRow[]).map((row) => toView(row, today));
        },

        async createMany(inputs: NewBatch[]) {
            if (inputs.length === 0) return 0;

            const responsible = inputs[0].responsibleName;
            if (inputs.some((input) => input.responsibleName !== responsible)) {
                throw new Error('MIXED_RESPONSIBLE');
            }

            const rpc = getSupabase().rpc as unknown as RegisterBatchesRpc;
            const { data, error } = await rpc('register_batches', {
                p_responsible: responsible,
                p_rows: inputs.map((input) => ({
                    product_name: input.productName,
                    quantity: input.quantity,
                    expiration_date: input.expirationDate,
                })),
            });

            if (error) throw error;

            return typeof data === 'number' ? data : inputs.length;
        },
    };
}
