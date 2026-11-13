import type { BatchView } from '@/types/domain';
import { toFriendlyMessage } from '@/lib/errors';
import type { NewBatch } from './batches-service';
import { getBatchesService } from './service';

/**
 * Estado compartido de los registros.
 *
 * Se implementa como store externo suscribible para que `useBatches` use
 * `useSyncExternalStore`: la carga inicial actualiza el estado cuando la
 * promesa resuelve, sin `setState` dentro de un efecto.
 */

export interface BatchesState {
    batches: BatchView[];
    loading: boolean;
    error: string | null;
}

let state: BatchesState = { batches: [], loading: true, error: null };
const listeners = new Set<() => void>();
let started = false;

function publish(patch: Partial<BatchesState>) {
    state = { ...state, ...patch };
    for (const listener of listeners) listener();
}

export function subscribe(listener: () => void): () => void {
    listeners.add(listener);

    if (!started) {
        started = true;
        void refresh();
    }

    return () => {
        listeners.delete(listener);
    };
}

export function getSnapshot(): BatchesState {
    return state;
}

/** Carga o recarga los registros desde el servicio. */
export async function refresh(): Promise<void> {
    try {
        const batches = await getBatchesService().list();
        publish({ batches, loading: false, error: null });
    } catch (cause) {
        publish({ loading: false, error: toFriendlyMessage(cause) });
    }
}

/** Guarda uno o varios registros; el alta es atómica en el servicio. */
export async function addBatches(inputs: NewBatch[]): Promise<number> {
    const count = await getBatchesService().createMany(inputs);
    await refresh();
    return count;
}

/**
 * Vacía el estado al cerrar sesión y obliga a recargar en el siguiente acceso,
 * para no mostrar datos de la sesión anterior.
 */
export function resetBatchesStore(): void {
    started = false;
    publish({ batches: [], loading: true, error: null });
}
