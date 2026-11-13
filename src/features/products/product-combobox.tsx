import { useId, useMemo, useRef, useState } from 'react';
import { CircleAlert, Search } from 'lucide-react';
import { cn } from '@/lib/cn';
import { suggestProducts } from '@/lib/products';

export interface ProductComboboxProps {
    id: string;
    label: string;
    value: string;
    catalog: string[];
    error?: string;
    placeholder?: string;
    autoFocus?: boolean;
    onChange: (value: string) => void;
}

/**
 * Campo de producto con autocompletado.
 *
 * Sugiere coincidencias del catálogo sin distinguir mayúsculas ni acentos,
 * pero permite escribir un nombre nuevo. Sigue el patrón ARIA de combobox con
 * listbox: flechas para navegar, Enter para elegir, Escape para cerrar.
 */
export function ProductCombobox({
    id,
    label,
    value,
    catalog,
    error,
    placeholder,
    autoFocus,
    onChange,
}: ProductComboboxProps) {
    const listId = useId();
    const errorId = `${id}-error`;
    const containerRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const suggestions = useMemo(() => suggestProducts(value, catalog), [value, catalog]);
    const showList = open && suggestions.length > 0;

    function choose(name: string) {
        onChange(name);
        setOpen(false);
        setActiveIndex(-1);
    }

    return (
        <div className="w-full" ref={containerRef}>
            <label
                htmlFor={id}
                className="mb-1.5 block text-[11px] font-semibold tracking-[0.08em] text-ink-muted uppercase"
            >
                {label}
            </label>

            <div className="relative">
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-muted"
                >
                    <Search size={15} />
                </span>

                <input
                    id={id}
                    type="text"
                    role="combobox"
                    aria-expanded={showList}
                    aria-controls={listId}
                    aria-autocomplete="list"
                    aria-activedescendant={
                        showList && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined
                    }
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : undefined}
                    autoComplete="off"
                    autoFocus={autoFocus}
                    maxLength={120}
                    placeholder={placeholder}
                    value={value}
                    className={cn(
                        'h-10 w-full rounded-control border bg-surface pr-3 pl-9 text-sm text-ink transition-colors placeholder:text-ink-muted focus-visible:border-accent',
                        error ? 'border-danger' : 'border-line-strong',
                    )}
                    onChange={(event) => {
                        onChange(event.target.value);
                        setOpen(true);
                        setActiveIndex(-1);
                    }}
                    onFocus={() => setOpen(true)}
                    onBlur={(event) => {
                        if (!containerRef.current?.contains(event.relatedTarget as Node | null)) {
                            setOpen(false);
                            setActiveIndex(-1);
                        }
                    }}
                    onKeyDown={(event) => {
                        if (event.key === 'ArrowDown' && suggestions.length > 0) {
                            event.preventDefault();
                            setOpen(true);
                            setActiveIndex((index) => (index + 1) % suggestions.length);
                            return;
                        }
                        if (event.key === 'ArrowUp' && suggestions.length > 0) {
                            event.preventDefault();
                            setActiveIndex(
                                (index) => (index - 1 + suggestions.length) % suggestions.length,
                            );
                            return;
                        }
                        if (event.key === 'Enter' && showList && activeIndex >= 0) {
                            event.preventDefault();
                            choose(suggestions[activeIndex]);
                            return;
                        }
                        if (event.key === 'Escape' && showList) {
                            event.preventDefault();
                            setOpen(false);
                            setActiveIndex(-1);
                        }
                    }}
                />

                {showList ? (
                    <ul
                        id={listId}
                        role="listbox"
                        aria-label="Productos sugeridos"
                        className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-control border border-line bg-surface py-1 shadow-lg"
                    >
                        {suggestions.map((name, index) => (
                            <li
                                key={name}
                                id={`${listId}-${index}`}
                                role="option"
                                aria-selected={index === activeIndex}
                                className={cn(
                                    'cursor-pointer px-3 py-2 text-sm',
                                    index === activeIndex
                                        ? 'bg-accent-soft text-ink'
                                        : 'text-ink-soft hover:bg-surface-sunken',
                                )}
                                onMouseDown={(event) => {
                                    event.preventDefault();
                                    choose(name);
                                }}
                                onMouseEnter={() => setActiveIndex(index)}
                            >
                                {name}
                            </li>
                        ))}
                    </ul>
                ) : null}
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
            ) : null}
        </div>
    );
}
