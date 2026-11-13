import { LayoutGrid, List, RotateCcw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Segmented } from '@/components/ui/segmented';
import { Select } from '@/components/ui/select';
import { STATUS_LABELS } from '@/lib/expiry';
import { hasActiveFilters } from '@/lib/filters';
import { formatNumber } from '@/lib/format';
import type { BatchFilters, ExpiryStatus, ViewMode } from '@/types/domain';

const STATUS_OPTIONS: ExpiryStatus[] = [
    'vigente',
    'proximo',
    'critico',
    'vence_hoy',
    'vencido',
];

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
    resultCount,
    totalCount,
    view,
    onChange,
    onClear,
    onViewChange,
}: FilterBarProps) {
    const active = hasActiveFilters(filters);
    const statusValue = filters.statuses[0] ?? '';

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

                <div className="lg:col-span-2">
                    <Select
                        id="filter-status"
                        label="Estado"
                        value={statusValue}
                        onChange={(event) =>
                            onChange({
                                statuses: event.target.value
                                    ? [event.target.value as ExpiryStatus]
                                    : [],
                            })
                        }
                    >
                        <option value="">Todos los estados</option>
                        {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                                {STATUS_LABELS[status]}
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
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                <div className="flex items-center gap-3">
                    <p className="text-[13px] text-ink-muted" aria-live="polite">
                        <span className="font-semibold text-ink tabular">
                            {formatNumber(resultCount)}
                        </span>{' '}
                        de {formatNumber(totalCount)} registros
                    </p>
                    {active ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClear}
                            className="text-ink-soft"
                        >
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
