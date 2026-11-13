import type { Session } from '@supabase/supabase-js';
import { isConfigured } from '@/lib/env';
import { getSupabase } from '@/lib/supabase';

/**
 * Estado de sesión como store externo suscribible (`useSyncExternalStore`).
 * Sin Supabase configurado termina la carga sin sesión; la app muestra la
 * pantalla de configuración.
 */

export interface AuthState {
    session: Session | null;
    loading: boolean;
}

let state: AuthState = { session: null, loading: true };
const listeners = new Set<() => void>();
let started = false;

function publish(patch: Partial<AuthState>) {
    state = { ...state, ...patch };
    for (const listener of listeners) listener();
}

export function subscribeAuth(listener: () => void): () => void {
    listeners.add(listener);

    if (!started) {
        started = true;

        if (!isConfigured()) {
            publish({ session: null, loading: false });
        } else {
            const supabase = getSupabase();

            void supabase.auth.getSession().then(({ data }) => {
                publish({ session: data.session, loading: false });
            });

            supabase.auth.onAuthStateChange((_event, session) => {
                publish({ session, loading: false });
            });
        }
    }

    return () => {
        listeners.delete(listener);
    };
}

export function getAuthSnapshot(): AuthState {
    return state;
}

export async function signIn(email: string, password: string): Promise<void> {
    const { error } = await getSupabase().auth.signInWithPassword({ email, password });
    if (error) throw error;
}

/**
 * Cierra la sesión.
 *
 * Si el servidor rechaza la revocación (por ejemplo, con un token ya inválido),
 * se limpia igualmente la sesión local para que la persona pueda volver a
 * entrar. Sin esto, un token caducado dejaba la app atrapada: no se podía
 * cerrar sesión y todas las operaciones fallaban.
 */
export async function signOut(): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signOut();

    if (error) {
        await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined);
    }
}

/** Refresca la sesión si está a punto de caducar (margen de 2 minutos). */
export async function ensureFreshSession(): Promise<void> {
    const supabase = getSupabase();
    const { data } = await supabase.auth.getSession();
    const session = data.session;

    if (!session) return;

    const endsAt = (session.expires_at ?? 0) * 1000;
    if (endsAt - Date.now() < 120_000) {
        await supabase.auth.refreshSession();
    }
}
