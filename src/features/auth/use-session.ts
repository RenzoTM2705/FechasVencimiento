import { useSyncExternalStore } from 'react';
import { getAuthSnapshot, subscribeAuth } from './auth-store';

/** Sesión activa de Supabase Auth. */
export function useSession() {
    return useSyncExternalStore(subscribeAuth, getAuthSnapshot, getAuthSnapshot);
}
