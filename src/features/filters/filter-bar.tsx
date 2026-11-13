import { useId, useState } from 'react';
import { LayoutGrid, List, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Segmented } from '@/components/ui/segmented';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/cn';
import { STATUS_LABELS } from '@/lib/expiry';
import { activeFilterCount, hasActiveFilters, toggleStatus } from '@/lib/filters';
import { formatNumber } from '@/lib/format';
import type {
    BatchFilters,
    ExpiryStatus,
    ProductOption,
    ViewMode,
} from '@/types/domain';

const STATUS_OPTIONS: ExpiryStatus[] = ['vigente', 'proximo', 'critico', 'vence_hoy', 'vencido'];

const DUE_OPTIONS = [7, 10, 15, 21, 30] as const;

const SORT_LABELS: Record<BatchFilters['sort'], string> = {
    expiration_asc: 'Vencimiento más próximo',
    expiration_desc: 'Vencimiento más lejano',
    quantity_asc: 'Cantidad: menor primero',
    quantity_desc: 'Cantidad: mayor primero',
    product_asc: 'Producto: A–Z',
};

export interface FilterBarProps {
    filters: BatchFilters;
    responsibleOptions: string[];
    productOptions: ProductOption[];
    resultCount: number;
    totalCount: number;
    view: ViewMode;
    onChange: (patch: Partial<BatchFilters>) => void;
    onClear: () => void;
    onViewChange: (view: ViewMode) => void;
}

export function FilterBar({
    filters,
    responsibleOptions,
    productOptions,
    resultCount,
    totalCount,
    view,
    onChange,
    onClear,
    onViewChange,
}: FilterBarProps) {
    const panelId = useId();
    const [expanded, setExpanded] = useState(false);
    const active = hasActiveFilters(filters);
    const activeCount = activeFilterCount(filters);

    return (
        <section
            aria-label="Búsqueda y filtros"
            className="rounded-card border border-line bg-surface p-3 shadow-card sm:p-4"
        >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
                <div className="sm:col-span-2 lg:col-span-4">
                    <Input
                        id="filter-search"
                        type="search"
                        label="Buscar producto"
                        placeholder="Ej.: leche gloria"
                        value={filters.search}
                        leadingIcon={<Search size={15} />}
                        onChange={(event) => onChange({ search: event.target.value })}
                    />
                </div>

                <div className="lg:col-span-3">
                    <Select
                        id="filter-responsible"
                        label="Encargado"
                        value={filters.responsible ?? ''}
                        onChange={(event) =>
                            onChange({ responsible: event.target.value || null })
                        }
                    >
                        <option value="">Todos los encargados</option>
                        {responsibleOptions.map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </Select>
                </div>

                <div className="lg:col-span-3">
                    <Select
                        id="filter-sort"
                        label="Ordenar por"
                        value={filters.sort}
                        onChange={(event) =>
                            onChange({ sort: event.target.value as BatchFilters['sort'] })
                        }
                    >
                        {Object.entries(SORT_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </Select>
                </div>

                <div className="lg:col-span-2">
                    <Button
                        variant="secondary"
                        className="w-full"
                        aria-expanded={expanded}
                        aria-controls={panelId}
                        onClick={() => setExpanded((value) => !value)}
                    >
                        <SlidersHorizontal size={15} aria-hidden="true" />
                        Filtros
                        {activeCount > 0 ? (
                            <span className="ml-0.5 rounded-full bg-brand px-1.5 py-0.5 text-[11px] leading-none text-white tabular">
                                {activeCount}
                            </span>
                        ) : null}
                    </Button>
                </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold tracking-[0.08em] text-ink-muted uppercase">
                    Estado
                </span>
                {STATUS_OPTIONS.map((status) => {
                    const on = filters.statuses.includes(status);
                    return (
                        <button
                            key={status}
                            type="button"
                            aria-pressed={on}
                            onClick={() =>
                                onChange({ statuses: toggleStatus(filters.statuses, status) })
                            }
                            className={cn(
                                'h-8 rounded-full border px-3 text-[13px] font-medium transition-colors duration-150',
                                on
                                    ? 'border-brand bg-brand text-white'
                                    : 'border-line-strong bg-surface text-ink-soft hover:bg-surface-sunken',
                            )}
                        >
                            {STATUS_LABELS[status]}
                        </button>
                    );
                })}
            </div>

            {expanded ? (
                <div
                    id={panelId}
                    className="mt-3 grid gap-3 border-t border-line pt-3 sm:grid-cols-2 lg:grid-cols-12"
                >
                    <div className="lg:col-span-3">
                        <Select
                            id="filter-product"
                            label="Producto"
                            value={filters.productId ?? ''}
                            onChange={(event) =>
                                onChange({ productId: event.target.value || null })
                            }
                        >
                            <option value="">Todos los productos</option>
                            {productOptions.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.name}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="lg:col-span-3">
                        <Input
                            id="filter-date-exact"
                            type="date"
                            label="Fecha exacta"
                            value={filters.dateExact ?? ''}
                            onChange={(event) =>
                                onChange({
                                    dateExact: event.target.value || null,
                                    dateFrom: null,
                                    dateTo: null,
                                })
                            }
                        />
                    </div>

                    <div className="lg:col-span-2">
                        <Select
                            id="filter-due"
                            label="Próximos"
                            value={filters.dueWithinDays === null ? '' : String(filters.dueWithinDays)}
                            onChange={(event) =>
                                onChange({
                                    dueWithinDays: event.target.value
                                        ? (Number(event.target.value) as BatchFilters['dueWithinDays'])
                                        : null,
                                })
                            }
                        >
                            <option value="">Cualquier fecha</option>
                            {DUE_OPTIONS.map((days) => (
                                <option key={days} value={days}>
                                    {days} días
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="lg:col-span-2">
                        <Input
                            id="filter-date-from"
                            type="date"
                            label="Desde"
                            value={filters.dateFrom ?? ''}
                            onChange={(event) =>
                                onChange({
                                    dateFrom: event.target.value || null,
                                    dateExact: null,
                                })
                            }
                        />
                    </div>

                    <div className="lg:col-span-2">
                        <Input
                            id="filter-date-to"
                            type="date"
                            label="Hasta"
                            value={filters.dateTo ?? ''}
                            onChange={(event) =>
                                onChange({
                                    dateTo: event.target.value || null,
                                    dateExact: null,
                                })
                            }
                        />
                    </div>
                </div>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                <div className="flex items-center gap-3">
                    <p className="text-[13px] text-ink-muted" aria-live="polite">
                        <span className="font-semibold text-ink tabular">
                            {formatNumber(resultCount)}
                        </span>{' '}
                        de {formatNumber(totalCount)} registros
                    </p>
                    {active ? (
                        <Button variant="ghost" size="sm" onClick={onClear} className="text-ink-soft">
                            <RotateCcw size={14} aria-hidden="true" />
                            Limpiar filtros
                        </Button>
                    ) : null}
                </div>

                <Segmented<ViewMode>
                    label="Modo de visualización"
                    value={view}
                    onChange={onViewChange}
                    options={[
                        {
                            value: 'table',
                            label: 'Tabla',
                            icon: <List size={15} aria-hidden="true" />,
                        },
                        {
                            value: 'cards',
                            label: 'Tarjetas',
                            icon: <LayoutGrid size={15} aria-hidden="true" />,
                        },
                    ]}
                />
            </div>
        </section>
    );
}
