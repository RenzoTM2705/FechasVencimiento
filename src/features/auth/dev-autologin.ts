import { signIn } from './auth-store';

/**
 * ACCESO DIRECTO TEMPORAL — SOLO DESARROLLO.
 *
 * Inicia sesión automáticamente con la cuenta configurada en `.env.local`:
 *
 *   VITE_ACCESO_DIRECTO=true
 *   VITE_ACCESO_DIRECTO_EMAIL=...
 *   VITE_ACCESO_DIRECTO_PASSWORD=...
 *
 * Este módulo se carga con `import()` dinámico solo cuando `import.meta.env.DEV`
 * es verdadero, así que el build de producción no lo incluye ni las
 * credenciales llegan al bundle. Para volver al acceso normal: pon
 * `VITE_ACCESO_DIRECTO=false` o borra esas líneas de `.env.local`.
 *
 * No sustituye al login: crea una sesión real contra Supabase, con RLS activa.
 */
export async function autoLogin(): Promise<void> {
    if (import.meta.env.VITE_ACCESO_DIRECTO !== 'true') return;

    const email = import.meta.env.VITE_ACCESO_DIRECTO_EMAIL;
    const password = import.meta.env.VITE_ACCESO_DIRECTO_PASSWORD;
    if (!email || !password) return;

    try {
        await signIn(email, password);
    } catch {
        // Si falla, la pantalla de acceso sigue disponible.
    }
}
