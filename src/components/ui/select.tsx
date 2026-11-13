import type { ReactNode, SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
    id: string;
    label: string;
    hint?: string;
    children: ReactNode;
}

export function Select({ id, label, hint, className, children, ...props }: SelectProps) {
    const hintId = `${id}-hint`;

    return (
        <div className="w-full">
            <label
                htmlFor={id}
                className="mb-1.5 block text-[11px] font-semibold tracking-[0.08em] text-ink-muted uppercase"
            >
                {label}
            </label>
            <div className="relative">
                <select
                    id={id}
                    aria-describedby={hint ? hintId : undefined}
                    className={cn(
                        'h-10 w-full appearance-none rounded-control border border-line-strong bg-surface pr-9 pl-3 text-sm text-ink transition-colors focus-visible:border-accent',
                        className,
                    )}
                    {...props}
                >
                    {children}
                </select>
                <ChevronDown
                    size={16}
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-ink-muted"
                />
            </div>
            {hint ? (
                <p id={hintId} className="mt-1 text-xs text-ink-muted">
                    {hint}
                </p>
            ) : null}
        </div>
    );
}
