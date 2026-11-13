import { AlarmClock, Check, Clock, TriangleAlert, X } from 'lucide-react';
import { STATUS_LABELS } from '@/lib/expiry';
import type { ExpiryStatus } from '@/types/domain';
import { Badge, type BadgeTone } from './badge';

const APPEARANCE: Record<ExpiryStatus, { tone: BadgeTone; Icon: typeof Check }> = {
    vigente: { tone: 'ok', Icon: Check },
    proximo: { tone: 'warn', Icon: Clock },
    critico: { tone: 'danger', Icon: TriangleAlert },
    vence_hoy: { tone: 'danger-solid', Icon: AlarmClock },
    vencido: { tone: 'expired', Icon: X },
};

export function StatusBadge({ status, className }: { status: ExpiryStatus; className?: string }) {
    const { tone, Icon } = APPEARANCE[status];

    return (
        <Badge tone={tone} className={className}>
            <Icon size={13} aria-hidden="true" strokeWidth={2.5} />
            {STATUS_LABELS[status]}
        </Badge>
    );
}
