import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type BadgeTone = 'neutral' | 'ok' | 'warn' | 'danger' | 'danger-solid' | 'expired';

const TONES: Record<BadgeTone, string> = {
    neutral: 'border-line bg-surface-sunken text-ink-soft',
    ok: 'border-ok-line bg-ok-soft text-ok',
    warn: 'border-warn-line bg-warn-soft text-warn',
    danger: 'border-danger-line bg-danger-soft text-danger',
    'danger-solid': 'border-danger bg-danger text-white',
    expired: 'hatch border-expired-line bg-expired-soft text-expired',
};

export interface BadgeProps {
    tone?: BadgeTone;
    children: ReactNode;
    className?: string;
}

export function Badge({ tone = 'neutral', children, className }: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-[10px] border px-2 py-0.5 text-[12px] leading-tight font-medium whitespace-nowrap',
                TONES[tone],
                className,
            )}
        >
            {children}
        </span>
    );
}
