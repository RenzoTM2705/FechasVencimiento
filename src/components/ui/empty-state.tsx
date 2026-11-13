import type { ReactNode } from 'react';

export interface EmptyStateProps {
    icon: ReactNode;
    title: string;
    description: string;
    action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-line-strong bg-surface px-6 py-14 text-center">
            <span
                aria-hidden="true"
                className="mb-3 grid h-11 w-11 place-items-center rounded-full bg-surface-sunken text-ink-muted"
            >
                {icon}
            </span>
            <h2 className="text-[17px] font-semibold text-ink">{title}</h2>
            <p className="mt-1 max-w-sm text-sm text-ink-soft">{description}</p>
            {action ? <div className="mt-4">{action}</div> : null}
        </div>
    );
}
