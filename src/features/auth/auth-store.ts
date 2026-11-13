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

export async function signOut(): Promise<void> {
    const { error } = await getSupabase().auth.signOut();
    if (error) throw error;
}
