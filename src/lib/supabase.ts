import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { readEnv } from './env';

let client: SupabaseClient<Database> | null = null;

/**
 * Cliente único de Supabase.
 *
 * Se crea de forma perezosa: importar este módulo no exige variables de entorno,
 * así el build y los tests funcionan sin .env.local. La sesión del administrador
 * se conserva entre recargas (persistSession) y se refresca automáticamente.
 */
export function getSupabase(): SupabaseClient<Database> {
    if (!client) {
        const { supabaseUrl, supabaseAnonKey } = readEnv();
        client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: false,
            },
        });
    }
    return client;
}
