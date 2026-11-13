import { useMemo, useState } from 'react';
import { Inbox } from 'lucide-react';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { BatchCards } from '@/features/batches/batch-cards';
import { BatchTable } from '@/features/batches/batch-table';
import { IndicatorCards } from '@/features/dashboard/indicator-cards';
import { FilterBar } from '@/features/filters/filter-bar';
import {
    DEFAULT_FILTERS,
    applyFilters,
    computeIndicators,
    hasActiveFilters,
    responsibleOptions,
} from '@/lib/filters';
import { groupByProduct } from '@/lib/grouping';
import { createMockBatches } from '@/lib/mock-data';
import { useViewMode } from '@/lib/use-view-mode';
import type { BatchFilters } from '@/types/domain';

export default function App() {
    const today = useMemo(() => new Date(), []);
    const allBatches = useMemo(() => createMockBatches(today), [today]);

    const [filters, setFilters] = useState<BatchFilters>(DEFAULT_FILTERS);
    const [view, setView] = useViewMode();

    const indicators = useMemo(() => computeIndicators(allBatches), [allBatches]);
    const filtered = useMemo(() => applyFilters(allBatches, filters), [allBatches, filters]);
    const groups = useMemo(() => groupByProduct(filtered), [filtered]);
    const people = useMemo(() => responsibleOptions(allBatches), [allBatches]);
    const filtersActive = hasActiveFilters(filters);

    const updateFilters = (patch: Partial<BatchFilters>) =>
        setFilters((current) => ({ ...current, ...patch }));

    return (
        <div className="flex min-h-dvh flex-col">
            <Header />

            <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 pt-6 pb-10 sm:px-6 lg:px-8">
                <div className="mb-5">
                    <h1 className="text-[26px] leading-tight font-semibold tracking-tight text-ink">
                        Vencimientos
                    </h1>
                    <p className="mt-1 text-sm text-ink-soft">
                        Consulta qué está por vencer y qué debes retirar hoy.
                    </p>
                </div>

                {import.meta.env.DEV ? (
                    <p className="mb-4 rounded-control border border-warn-line bg-warn-soft px-3 py-2 text-[13px] text-warn">
                        Datos de ejemplo de la Fase 2. La persistencia real se conecta en la Fase 4.
                    </p>
                ) : null}

                <IndicatorCards indicators={indicators} />

                <div className="mt-5">
                    <FilterBar
                        filters={filters}
                        responsibleOptions={people}
                        resultCount={filtered.length}
                        totalCount={allBatches.length}
                        view={view}
                        onChange={updateFilters}
                        onClear={() => setFilters(DEFAULT_FILTERS)}
                        onViewChange={setView}
                    />
                </div>

                <div className="mt-4">
                    {filtered.length === 0 ? (
                        <EmptyState
                            icon={<Inbox size={20} aria-hidden="true" />}
                            title="No encontramos registros con esos filtros"
                            description="Prueba con otro producto, otro encargado o limpia los filtros para ver todo."
                            action={
                                filtersActive ? (
                                    <Button onClick={() => setFilters(DEFAULT_FILTERS)}>
                                        Limpiar filtros
                                    </Button>
                                ) : undefined
                            }
                        />
                    ) : view === 'table' ? (
                        <BatchTable batches={filtered} />
                    ) : (
                        <BatchCards groups={groups} />
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
