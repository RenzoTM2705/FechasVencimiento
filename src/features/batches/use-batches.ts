import { useSyncExternalStore } from 'react';
import type { BatchView } from '@/types/domain';
import type { NewBatch, UpdateBatch } from './batches-service';
import { addBatches, getSnapshot, refresh, removeBatch, subscribe, updateBatch } from './batches-store';

export interface UseBatchesResult {
    batches: BatchView[];
    loading: boolean;
    error: string | null;
    createMany: (inputs: NewBatch[]) => Promise<number>;
    updateBatch: (batch: UpdateBatch) => Promise<void>;
    removeBatch: (id: string) => Promise<void>;
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

    return {
        batches,
        loading,
        error,
        createMany: addBatches,
        updateBatch,
        removeBatch,
        refresh,
    };
}
