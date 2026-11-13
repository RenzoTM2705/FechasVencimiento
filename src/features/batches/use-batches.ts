import { useSyncExternalStore } from 'react';
import type { BatchView } from '@/types/domain';
import type { NewBatch } from './batches-service';
import { addBatches, getSnapshot, refresh, subscribe } from './batches-store';

export interface UseBatchesResult {
    batches: BatchView[];
    loading: boolean;
    error: string | null;
    createMany: (inputs: NewBatch[]) => Promise<number>;
    refresh: () => Promise<void>;
}

/**
 * Acceso reactivo a los registros de vencimiento. La interfaz no conoce el
 * origen de los datos: en la Fase 4 el servicio pasa a ser Supabase sin tocar
 * los componentes.
 */
export function useBatches(): UseBatchesResult {
    const { batches, loading, error } = useSyncExternalStore(
        subscribe,
        getSnapshot,
        getSnapshot,
    );

    return { batches, loading, error, createMany: addBatches, refresh };
}
