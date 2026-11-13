import { useEffect } from 'react';
import { DashboardPage } from '@/app/dashboard-page';
import { ConfigMissingPage } from '@/features/auth/config-missing-page';
import { LoginPage } from '@/features/auth/login-page';
import { useSession } from '@/features/auth/use-session';
import { accessMode, isConfigured } from '@/lib/env';

/**
 * Pantalla de carga con el logotipo de la tienda.
 * El anillo gira; con `prefers-reduced-motion` se detiene (ver styles).
 */
function LoadingScreen() {
    return (
        <div
            role="status"
            aria-live="polite"
            className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-canvas"
        >
            <img
                src="/logo-mark.png"
                alt="Mass"
                width={239}
                height={75}
                className="h-14 w-auto drop-shadow-sm"
            />
            <div className="flex items-center gap-2 text-sm text-ink-soft">
                <span
                    aria-hidden="true"
                    className="h-4 w-4 animate-spin rounded-full border-2 border-line-strong border-t-brand"
                />
                Cargando…
            </div>
        </div>
    );
}

/**
 * Puerta de entrada: configuración → sesión → panel.
 *
 * En desarrollo sin Supabase configurado se muestra el panel con datos de
 * ejemplo; en producción se exige configuración.
 *
 * ACCESO DIRECTO TEMPORAL: con `VITE_ACCESO_DIRECTO=true` en `.env.local`, en
 * desarrollo se inicia sesión automáticamente (ver dev-autologin.ts).
 *
 * MODO PÚBLICO: con `VITE_MODO_ACCESO=publico` no se pide sesión; requiere las
 * políticas de `supabase/migrations/0005_modo_publico.sql`. Ver README.
 */
export default function App() {
    const configured = isConfigured();
    const { session, loading } = useSession();

    useEffect(() => {
        if (!import.meta.env.DEV) return;
        void import('@/features/auth/dev-autologin').then((module) => module.autoLogin());
    }, []);

    // Atajo de desarrollo para revisar la pantalla de carga: `?cargando=1`.
    if (import.meta.env.DEV && new URLSearchParams(window.location.search).has('cargando')) {
        return <LoadingScreen />;
    }

    if (!configured) {
        return import.meta.env.DEV ? <DashboardPage /> : <ConfigMissingPage />;
    }

    if (accessMode() === 'publico') return <DashboardPage />;

    if (loading) return <LoadingScreen />;
    if (!session) return <LoginPage />;

    return <DashboardPage />;
}
