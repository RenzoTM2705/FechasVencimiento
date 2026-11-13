import { AlarmClock, Clock, Package, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatNumber } from '@/lib/format';
import type { Indicators } from '@/types/domain';

interface CardDefinition {
    key: keyof Indicators;
    label: string;
    caption: string;
    rail: string;
    Icon: typeof Package;
}

const CARDS: CardDefinition[] = [
    {
        key: 'total',
        label: 'Total registros',
        caption: 'Vencimientos registrados',
        rail: 'bg-brand',
        Icon: Package,
    },
    {
        key: 'dueSoon',
        label: 'Por vencer',
        caption: 'En los próximos 21 días',
        rail: 'bg-warn',
        Icon: Clock,
    },
    {
        key: 'dueToday',
        label: 'Vencen hoy',
        caption: 'Retirar inmediatamente',
        rail: 'bg-danger',
        Icon: AlarmClock,
    },
    {
        key: 'expired',
        label: 'Vencidos',
        caption: 'Requieren retiro',
        rail: 'bg-expired',
        Icon: X,
    },
];

export function IndicatorCards({ indicators }: { indicators: Indicators }) {
    return (
        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {CARDS.map(({ key, label, caption, rail, Icon }) => (
                <div
                    key={key}
                    className="relative overflow-hidden rounded-card border border-line bg-surface p-4 shadow-card"
                >
                    <span aria-hidden="true" className={cn('absolute inset-x-0 top-0 h-[3px]', rail)} />
                    <dt className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.08em] text-ink-muted uppercase">
                        <Icon size={13} aria-hidden="true" className="text-ink-muted" />
                        {label}
                    </dt>
                    <dd className="mt-1.5 text-[28px] leading-none font-semibold tracking-tight text-ink tabular">
                        {formatNumber(indicators[key])}
                    </dd>
                    <p className="mt-1.5 text-xs text-ink-muted">{caption}</p>
                </div>
            ))}
        </dl>
    );
}
