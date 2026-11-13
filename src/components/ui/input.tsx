import type { InputHTMLAttributes, ReactNode } from 'react';
import { CircleAlert } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
    id: string;
    label: string;
    error?: string;
    hint?: string;
    leadingIcon?: ReactNode;
}

export function Input({ id, label, error, hint, leadingIcon, className, ...props }: InputProps) {
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;
    const describedBy = error ? errorId : hint ? hintId : undefined;

    return (
        <div className="w-full">
            <label
                htmlFor={id}
                className="mb-1.5 block text-[11px] font-semibold tracking-[0.08em] text-ink-muted uppercase"
            >
                {label}
            </label>
            <div className="relative">
                {leadingIcon ? (
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-muted"
                    >
                        {leadingIcon}
                    </span>
                ) : null}
                <input
                    id={id}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={describedBy}
                    className={cn(
                        'h-10 w-full rounded-control border bg-surface pr-3 text-sm text-ink transition-colors placeholder:text-ink-muted focus-visible:border-accent',
                        leadingIcon ? 'pl-9' : 'pl-3',
                        error ? 'border-danger' : 'border-line-strong',
                        className,
                    )}
                    {...props}
                />
            </div>
            {error ? (
                <p
                    id={errorId}
                    role="alert"
                    className="mt-1 flex items-center gap-1 text-xs font-medium text-danger"
                >
                    <CircleAlert size={13} aria-hidden="true" />
                    {error}
                </p>
            ) : hint ? (
                <p id={hintId} className="mt-1 text-xs text-ink-muted">
                    {hint}
                </p>
            ) : null}
        </div>
    );
}
