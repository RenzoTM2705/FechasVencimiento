import { AlarmClock, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { ExpiryStatus } from '@/types/domain';

export interface RemovalNoticeProps {
    days: number;
    status: ExpiryStatus;
    className?: string;
}

/**
 * Aviso obligatorio cuando la fecha ya se cumplió (0 días o vencido).
 *
 * Mismo texto legal para ambos casos; el caso se distingue por icono, color y
 * trama: «vence hoy» va en rojo sólido con reloj y «vencido» en rojo oscuro
 * tramado con una X. Nunca depende solo del color, porque el estado también
 * aparece como etiqueta en la fila.
 */
export function RemovalNotice({ days, status, className }: RemovalNoticeProps) {
    if (days > 0) return null;

    const isToday = status === 'vence_hoy';
    const Icon = isToday ? AlarmClock : X;

    return (
        <p
            className={cn(
                'inline-flex items-center gap-1 rounded-[6px] border px-1.5 py-0.5 text-[10.5px] leading-tight font-semibold tracking-[0.04em] whitespace-nowrap uppercase',
                isToday
                    ? 'border-danger bg-danger text-white'
                    : 'hatch border-expired-line bg-expired-soft text-expired',
                className,
            )}
        >
            <Icon size={12} aria-hidden="true" strokeWidth={2.5} />
            Fecha cumplida, retirar inmediatamente
        </p>
    );
}
