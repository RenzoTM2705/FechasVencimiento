import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface SegmentedOption<T extends string> {
    value: T;
    label: string;
    icon: ReactNode;
}

export interface SegmentedProps<T extends string> {
    label: string;
    value: T;
    options: SegmentedOption<T>[];
    onChange: (value: T) => void;
}

export function Segmented<T extends string>({
    label,
    value,
    options,
    onChange,
}: SegmentedProps<T>) {
    return (
        <div
            role="group"
            aria-label={label}
            className="inline-flex rounded-control border border-line-strong bg-surface p-0.5"
        >
            {options.map((option) => {
                const active = option.value === value;
                return (
                    <button
                        key={option.value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => onChange(option.value)}
                        className={cn(
                            'inline-flex h-9 items-center gap-1.5 rounded-[6px] px-3 text-[13px] font-medium transition-colors duration-150',
                            active
                                ? 'bg-brand text-white'
                                : 'text-ink-soft hover:bg-surface-sunken',
                        )}
                    >
                        {option.icon}
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}
