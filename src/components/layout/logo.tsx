import { cn } from '@/lib/cn';

/**
 * Marcador de logotipo (placeholder aprobado en docs/UX.md).
 *
 * Se dibuja en línea para que se vea nítido y no dependa de una petición de
 * red. Para sustituirlo por el logotipo definitivo: reemplaza este componente
 * y `public/logo.svg` (favicon).
 */
export function Logo({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 48 48"
            role="img"
            aria-label="Control de Vencimientos"
            focusable="false"
            className={cn('h-9 w-9 shrink-0', className)}
        >
            <rect width="48" height="48" rx="11" fill="#0f172a" />
            <path
                d="M13.5 16.5h21M13.5 23.5h11.5M13.5 30.5h8"
                stroke="#ffffff"
                strokeWidth="3.2"
                strokeLinecap="round"
            />
            <circle cx="33.5" cy="30" r="6.8" fill="#0f172a" stroke="#7cc4e8" strokeWidth="2.8" />
            <path
                d="M33.5 26.8V30l2.3 1.9"
                stroke="#7cc4e8"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
