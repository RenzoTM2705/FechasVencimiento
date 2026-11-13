import { isConfigured } from '@/lib/env';
import type { BatchesService } from './batches-service';
import { createMemoryBatchesService } from './memory-batches-service';
import { createSupabaseBatchesService } from './supabase-batches-service';

let instance: BatchesService | null = null;

/** `true` cuando la app corre sin Supabase: datos de ejemplo, sin persistencia. */
export function isDemoMode(): boolean {
    return !isConfigured();
}

/**
 * Origen de datos activo. Con Supabase configurado usa la base real; sin
 * configurar (solo desarrollo) usa memoria para poder revisar la interfaz.
 * En producción, la app nunca llega aquí sin configuración: muestra la
 * pantalla de configuración.
 */
export function getBatchesService(): BatchesService {
    if (!instance) {
        instance = isConfigured()
            ? createSupabaseBatchesService()
            : createMemoryBatchesService();
    }
    return instance;
}
