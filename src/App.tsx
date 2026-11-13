/**
 * Punto de entrada de la aplicación.
 *
 * En la Fase 1 solo verifica que el scaffold funciona (Vite + React + TypeScript +
 * Tailwind). La interfaz real (header, indicadores, filtros, tabla y tarjetas) se
 * construye en la Fase 2, según docs/IMPLEMENTATION_PLAN.md.
 */
export default function App() {
    return (
        <main className="grid min-h-dvh place-items-center p-6">
            <section className="w-full max-w-md space-y-3 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">Control de Vencimientos</h1>
                <p className="text-sm text-slate-600">
                    Configuración inicial completada: Vite, React, TypeScript, Tailwind y Vitest
                    funcionando. La interfaz se construye en la Fase 2.
                </p>
            </section>
        </main>
    );
}
