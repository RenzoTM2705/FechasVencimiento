import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'icon';

const VARIANTS: Record<Variant, string> = {
    primary: 'border border-transparent bg-brand text-white hover:bg-brand-hover',
    secondary: 'border border-line-strong bg-surface text-ink hover:bg-surface-sunken',
    ghost: 'border border-transparent bg-transparent text-ink-soft hover:bg-surface-sunken',
    danger: 'border border-transparent bg-danger text-white hover:brightness-95',
};

const SIZES: Record<Size, string> = {
    sm: 'h-9 px-3 text-[13px]',
    md: 'h-10 px-4 text-sm',
    icon: 'h-10 w-10',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
}

export function Button({
    variant = 'secondary',
    size = 'md',
    className,
    type = 'button',
    ...props
}: ButtonProps) {
    return (
        <button
            type={type}
            className={cn(
                'inline-flex items-center justify-center gap-2 rounded-control font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50',
                VARIANTS[variant],
                SIZES[size],
                className,
            )}
            {...props}
        />
    );
}
