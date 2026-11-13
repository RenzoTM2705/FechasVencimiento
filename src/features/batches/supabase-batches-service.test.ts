import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Regresión: `rpc` es un método del cliente que usa `this.rest`. Si se extrae
 * y se llama sin contexto, lanza `TypeError: Cannot read properties of
 * undefined (reading 'rest')` y el guardado falla sin hacer la petición.
 */

const rpcMock = vi.fn(function rpc(this: unknown, ...args: unknown[]) {
    void args;
    if (!this || !(this as { rest?: unknown }).rest) {
        throw new TypeError("Cannot read properties of undefined (reading 'rest')");
    }
    return Promise.resolve({ data: 1, error: null });
});

const client = {
    rest: { url: 'https://example.supabase.co/rest/v1' },
    rpc: rpcMock,
    from: () => ({
        select: () => ({
            order: () => Promise.resolve({ data: [], error: null }),
        }),
        delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
    }),
    auth: { refreshSession: async () => ({ error: null }) },
};

vi.mock('@/lib/supabase', () => ({ getSupabase: () => client }));
vi.mock('@/features/auth/auth-store', () => ({ ensureFreshSession: async () => undefined }));

const { createSupabaseBatchesService } = await import('./supabase-batches-service');

describe('supabase-batches-service', () => {
    beforeEach(() => {
        rpcMock.mockClear();
    });

    it('registra lotes conservando el contexto del cliente', async () => {
        const service = createSupabaseBatchesService();

        const count = await service.createMany([
            {
                responsibleName: 'Carlos',
                productName: 'Leche Gloria',
                quantity: 2,
                expirationDate: '2026-12-01',
            },
        ]);

        expect(count).toBe(1);
        expect(rpcMock).toHaveBeenCalledTimes(1);
        expect(rpcMock.mock.calls[0][0]).toBe('register_batches');
    });

    it('edita registros conservando el contexto del cliente', async () => {
        const service = createSupabaseBatchesService();

        await service.update({
            id: 'batch-1',
            responsibleName: 'Carlos',
            productName: 'Leche Gloria',
            quantity: 5,
            expirationDate: '2026-12-10',
        });

        expect(rpcMock.mock.calls[0][0]).toBe('update_batch');
    });
});
