import { useEffect } from 'react';
import { DashboardPage } from '@/app/dashboard-page';
import { Logo } from '@/components/layout/logo';
import { ConfigMissingPage } from '@/features/auth/config-missing-page';
import { LoginPage } from '@/features/auth/login-page';
import { useSession } from '@/features/auth/use-session';
import { isConfigured } from '@/lib/env';

function LoadingScreen() {
    return (
        <div
            role="status"
            aria-live="polite"
            className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-canvas"
        >
            <Logo className="h-11 w-11" />
            <p className="text-sm text-ink-soft">Cargando…</p>
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
 * desarrollo se inicia sesión automáticamente (ver dev-autologin.ts). El
 * módulo se importa de forma dinámica dentro del bloque de desarrollo, así que
 * el bundle de producción no lo incluye.
 */
export default function App() {
    const configured = isConfigured();
    const { session, loading } = useSession();

    useEffect(() => {
        if (!import.meta.env.DEV) return;
        void import('@/features/auth/dev-autologin').then((module) => module.autoLogin());
    }, []);

    if (!configured) {
        return import.meta.env.DEV ? <DashboardPage /> : <ConfigMissingPage />;
    }

    if (loading) return <LoadingScreen />;
    if (!session) return <LoginPage />;

    return <DashboardPage />;
}
