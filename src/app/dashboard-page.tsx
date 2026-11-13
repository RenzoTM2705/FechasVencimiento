import { useMemo, useState } from 'react';
import { Download, Inbox, Plus, Rows3, TriangleAlert } from 'lucide-react';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { resetBatchesStore } from '@/features/batches/batches-store';
import { BatchCards } from '@/features/batches/batch-cards';
import { BatchFormDialog } from '@/features/batches/batch-form-dialog';
import { BatchTable } from '@/features/batches/batch-table';
import { BulkFormDialog } from '@/features/batches/bulk-form-dialog';
import { DeleteDialog } from '@/features/batches/delete-dialog';
import { isDemoMode } from '@/features/batches/service';
import { useBatches } from '@/features/batches/use-batches';
import { ExportDialog, type ExportScope } from '@/features/export/export-dialog';
import { signOut } from '@/features/auth/auth-store';
import { useSession } from '@/features/auth/use-session';
import { IndicatorCards } from '@/features/dashboard/indicator-cards';
import { FilterBar } from '@/features/filters/filter-bar';
import {
    DEFAULT_FILTERS,
    applyFilters,
    computeIndicators,
    hasActiveFilters,
    responsibleOptions,
} from '@/lib/filters';
import { buildExportRows, downloadFile, exportFileName, toCsv, type ExportFormat } from '@/lib/export';
import { groupByProduct } from '@/lib/grouping';
import { productOptions, uniqueProductNames } from '@/lib/products';
import { useViewMode } from '@/lib/use-view-mode';
import type { ValidatedBatch } from '@/lib/validation';
import type { BatchFilters, BatchView } from '@/types/domain';

type DialogMode = 'single' | 'bulk' | null;

/**
 * Atajo de desarrollo: `?demo=single` o `?demo=bulk` abre el formulario al
 * cargar. Se elimina del build de producción (`import.meta.env.DEV` es falso).
 */
function initialDialog(): DialogMode {
    if (!import.meta.env.DEV) return null;
    const demo = new URLSearchParams(window.location.search).get('demo');
    return demo === 'single' || demo === 'bulk' ? demo : null;
}

export function DashboardPage() {
    const { session } = useSession();
    const { batches, loading, error, createMany, updateBatch, removeBatch, refresh } =
        useBatches();
    const [filters, setFilters] = useState<BatchFilters>(DEFAULT_FILTERS);
    const [view, setView] = useViewMode();
    const [dialog, setDialog] = useState<DialogMode>(initialDialog);
    const [editing, setEditing] = useState<BatchView | null>(null);
    const [deleting, setDeleting] = useState<BatchView | null>(null);
    const [exporting, setExporting] = useState(false);
    const [status, setStatus] = useState<string | null>(null);

    const indicators = useMemo(() => computeIndicators(batches), [batches]);
    const filtered = useMemo(() => applyFilters(batches, filters), [batches, filters]);
    const groups = useMemo(() => groupByProduct(filtered), [filtered]);
    const people = useMemo(() => responsibleOptions(batches), [batches]);
    const catalog = useMemo(() => uniqueProductNames(batches), [batches]);
    const productCatalog = useMemo(() => productOptions(batches), [batches]);
    const filtersActive = hasActiveFilters(filters);
    const isEmpty = batches.length === 0;
    const immediateRemoval = indicators.dueToday + indicators.expired;

    function updateFilters(patch: Partial<BatchFilters>) {
        setFilters((current) => ({ ...current, ...patch }));
    }

    async function handleCreateSingle(value: ValidatedBatch) {
        await createMany([value]);
        setDialog(null);
        setStatus('Producto registrado.');
    }

    async function handleCreateBulk(values: ValidatedBatch[]) {
        const count = await createMany(values);
        setDialog(null);
        setStatus(count === 1 ? 'Producto registrado.' : `${count} productos registrados.`);
    }

    async function handleUpdate(value: ValidatedBatch) {
        if (!editing) return;
        await updateBatch({ id: editing.id, ...value });
        setEditing(null);
        setStatus('Registro actualizado.');
    }

    async function handleDelete() {
        if (!deleting) return;
        await removeBatch(deleting.id);
        setDeleting(null);
        setStatus('Registro eliminado.');
    }

    async function handleExport(format: ExportFormat, scope: ExportScope) {
        const source = scope === 'all' ? batches : filtered;
        const rows = buildExportRows(source);
        const fileName = exportFileName(format);

        if (format === 'csv') {
            downloadFile(toCsv(rows), fileName, 'text/csv;charset=utf-8');
        } else {
            // El generador de Excel se carga solo al usarlo (chunk aparte).
            const { downloadXlsx } = await import('@/lib/export-xlsx');
            await downloadXlsx(rows, fileName);
        }

        setExporting(false);
        setStatus(`Exportados ${rows.length} registros en ${format.toUpperCase()}.`);
    }

    async function handleSignOut() {
        try {
            await signOut();
        } finally {
            resetBatchesStore();
        }
    }

    return (
        <div className="flex min-h-dvh flex-col">
            <Header onSignOut={session ? () => void handleSignOut() : undefined} />

            <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 pt-6 pb-10 sm:px-6 lg:px-8">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-[26px] leading-tight font-semibold tracking-tight text-ink">
                            Vencimientos
                        </h1>
                        <p className="mt-1 text-sm text-ink-soft">
                            Consulta qué está por vencer y qué debes retirar hoy.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button variant="secondary" onClick={() => setExporting(true)}>
                            <Download size={16} aria-hidden="true" />
                            Exportar
                        </Button>
                        <Button variant="secondary" onClick={() => setDialog('bulk')}>
                            <Rows3 size={16} aria-hidden="true" />
                            Registrar varios
                        </Button>
                        <Button variant="primary" onClick={() => setDialog('single')}>
                            <Plus size={16} aria-hidden="true" />
                            Registrar producto
                        </Button>
                    </div>
                </div>

                {isDemoMode() ? (
                    <p className="mb-4 rounded-control border border-warn-line bg-warn-soft px-3 py-2 text-[13px] text-warn">
                        Modo demostración: los datos viven en memoria y no se guardan. Configura
                        Supabase en <code>.env.local</code> para persistir.
                    </p>
                ) : null}

                {status ? (
                    <p
                        role="status"
                        className="mb-4 rounded-control border border-ok-line bg-ok-soft px-3 py-2 text-sm text-ok"
                    >
                        {status}
                    </p>
                ) : null}

                {error ? (
                    <div
                        role="alert"
                        className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-control border border-danger-line bg-danger-soft px-3 py-2 text-sm text-danger"
                    >
                        <span>{error}</span>
                        <Button variant="secondary" size="sm" onClick={() => void refresh()}>
                            Reintentar
                        </Button>
                    </div>
                ) : null}

                {immediateRemoval > 0 ? (
                    <div
                        role="alert"
                        className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-control border border-danger-line bg-danger-soft px-3 py-2.5 text-sm text-danger"
                    >
                        <p className="flex items-center gap-2">
                            <TriangleAlert size={16} aria-hidden="true" className="shrink-0" />
                            <span>
                                <strong className="font-semibold">{immediateRemoval}</strong>{' '}
                                {immediateRemoval === 1
                                    ? 'registro tiene la fecha cumplida'
                                    : 'registros tienen la fecha cumplida'}
                                . Retíralos inmediatamente.
                            </span>
                        </p>
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() =>
                                updateFilters({ statuses: ['vence_hoy', 'vencido'] })
                            }
                        >
                            Ver solo estos
                        </Button>
                    </div>
                ) : null}

                <IndicatorCards indicators={indicators} />

                <div className="mt-5">
                    <FilterBar
                        filters={filters}
                        responsibleOptions={people}
                        productOptions={productCatalog}
                        resultCount={filtered.length}
                        totalCount={batches.length}
                        view={view}
                        onChange={updateFilters}
                        onClear={() => setFilters(DEFAULT_FILTERS)}
                        onViewChange={setView}
                    />
                </div>

                <div className="mt-4">
                    {loading && isEmpty ? (
                        <div
                            role="status"
                            aria-live="polite"
                            className="h-64 animate-pulse rounded-card border border-line bg-surface"
                        >
                            <span className="sr-only">Cargando registros…</span>
                        </div>
                    ) : filtered.length === 0 ? (
                        <EmptyState
                            icon={<Inbox size={20} aria-hidden="true" />}
                            title={
                                isEmpty
                                    ? 'Aún no hay productos registrados'
                                    : 'No encontramos registros con esos filtros'
                            }
                            description={
                                isEmpty
                                    ? 'Registra el primer producto con su fecha de vencimiento para empezar a controlarlos.'
                                    : 'Prueba con otro producto, otro encargado o limpia los filtros para ver todo.'
                            }
                            action={
                                isEmpty ? (
                                    <Button variant="primary" onClick={() => setDialog('single')}>
                                        <Plus size={16} aria-hidden="true" />
                                        Registrar producto
                                    </Button>
                                ) : filtersActive ? (
                                    <Button
                                        variant="secondary"
                                        onClick={() => setFilters(DEFAULT_FILTERS)}
                                    >
                                        Limpiar filtros
                                    </Button>
                                ) : undefined
                            }
                        />
                    ) : view === 'table' ? (
                        <BatchTable batches={filtered} onEdit={setEditing} onDelete={setDeleting} />
                    ) : (
                        <BatchCards
                            groups={groups}
                            onEdit={setEditing}
                            onDelete={setDeleting}
                        />
                    )}
                </div>
            </main>

            <Footer />

            {dialog === 'single' ? (
                <BatchFormDialog
                    catalog={catalog}
                    onClose={() => setDialog(null)}
                    onSubmit={handleCreateSingle}
                />
            ) : null}

            {dialog === 'bulk' ? (
                <BulkFormDialog
                    catalog={catalog}
                    onClose={() => setDialog(null)}
                    onSubmit={handleCreateBulk}
                />
            ) : null}

            {editing ? (
                <BatchFormDialog
                    catalog={catalog}
                    initial={{
                        responsibleName: editing.responsibleName,
                        productName: editing.productName,
                        quantity: editing.quantity,
                        expirationDate: editing.expirationDate,
                    }}
                    onClose={() => setEditing(null)}
                    onSubmit={handleUpdate}
                />
            ) : null}

            {deleting ? (
                <DeleteDialog
                    batch={deleting}
                    onClose={() => setDeleting(null)}
                    onConfirm={handleDelete}
                />
            ) : null}

            {exporting ? (
                <ExportDialog
                    allCount={batches.length}
                    filteredCount={filtered.length}
                    onClose={() => setExporting(false)}
                    onExport={handleExport}
                />
            ) : null}
        </div>
    );
}
