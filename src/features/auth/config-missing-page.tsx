import { ServerCrash } from 'lucide-react';

/**
 * Pantalla que se muestra cuando faltan las variables de Supabase en un build
 * de producción. No revela valores: solo los nombres de las variables.
 */
export function ConfigMissingPage() {
    return (
        <div className="flex min-h-dvh items-center justify-center bg-canvas px-4 py-10">
            <div className="w-full max-w-lg rounded-card border border-line bg-surface p-6 shadow-card">
                <span
                    aria-hidden="true"
                    className="mb-4 inline-grid h-11 w-11 place-items-center rounded-full bg-warn-soft text-warn"
                >
                    <ServerCrash size={20} />
                </span>

                <h1 className="text-[20px] leading-snug font-semibold text-ink">
                    Falta configurar la base de datos
                </h1>
                <p className="mt-2 text-sm text-ink-soft">
                    La aplicación necesita conectarse a Supabase. Define estas variables de entorno
                    en tu entorno local o en Vercel y vuelve a compilar:
                </p>

                <ul className="mt-4 space-y-2 text-sm">
                    <li className="rounded-control border border-line bg-surface-sunken px-3 py-2 font-mono text-[13px] text-ink">
                        VITE_SUPABASE_URL
                    </li>
                    <li className="rounded-control border border-line bg-surface-sunken px-3 py-2 font-mono text-[13px] text-ink">
                        VITE_SUPABASE_ANON_KEY
                    </li>
                </ul>

                <p className="mt-4 text-[13px] text-ink-muted">
                    Nunca uses la clave <code>service_role</code>: omite las políticas de seguridad.
                    El paso a paso está en el README.
                </p>
            </div>
        </div>
    );
}
