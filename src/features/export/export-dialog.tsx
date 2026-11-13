import { useId, useState } from 'react';
import { CircleAlert, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { toFriendlyMessage } from '@/lib/errors';
import { formatNumber } from '@/lib/format';
import type { ExportFormat } from '@/lib/export';

export type ExportScope = 'all' | 'filtered';

export interface ExportDialogProps {
    allCount: number;
    filteredCount: number;
    onClose: () => void;
    onExport: (format: ExportFormat, scope: ExportScope) => Promise<void>;
}

export function ExportDialog({ allCount, filteredCount, onClose, onExport }: ExportDialogProps) {
    const formId = useId();
    const [format, setFormat] = useState<ExportFormat>('csv');
    const [scope, setScope] = useState<ExportScope>('all');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleExport() {
        setSubmitting(true);
        setError(null);
        try {
            await onExport(format, scope);
        } catch (cause) {
            setError(toFriendlyMessage(cause));
            setSubmitting(false);
        }
    }

    return (
        <Dialog
            title="Exportar registros"
            description="Se descarga un archivo con un registro por fila, sin agrupar ni sumar cantidades."
            onClose={onClose}
        >
            {error ? (
                <p
                    role="alert"
                    className="mb-4 flex items-center gap-2 rounded-control border border-danger-line bg-danger-soft px-3 py-2 text-sm text-danger"
                >
                    <CircleAlert size={16} aria-hidden="true" />
                    {error}
                </p>
            ) : null}

            <fieldset>
                <legend className="mb-2 text-[11px] font-semibold tracking-[0.08em] text-ink-muted uppercase">
                    Formato
                </legend>
                <div className="grid gap-2 sm:grid-cols-2">
                    <label className="flex cursor-pointer items-start gap-2 rounded-control border border-line-strong px-3 py-2.5 text-sm has-[:checked]:border-brand has-[:checked]:bg-surface-sunken">
                        <input
                            type="radio"
                            name={`${formId}-format`}
                            value="csv"
                            checked={format === 'csv'}
                            onChange={() => setFormat('csv')}
                            className="mt-0.5 accent-[var(--color-brand)]"
                        />
                        <span>
                            <span className="block font-medium text-ink">CSV</span>
                            <span className="block text-[13px] text-ink-muted">
                                Se abre en Excel y Google Sheets
                            </span>
                        </span>
                    </label>
                    <label className="flex cursor-pointer items-start gap-2 rounded-control border border-line-strong px-3 py-2.5 text-sm has-[:checked]:border-brand has-[:checked]:bg-surface-sunken">
                        <input
                            type="radio"
                            name={`${formId}-format`}
                            value="xlsx"
                            checked={format === 'xlsx'}
                            onChange={() => setFormat('xlsx')}
                            className="mt-0.5 accent-[var(--color-brand)]"
                        />
                        <span>
                            <span className="block font-medium text-ink">Excel (.xlsx)</span>
                            <span className="block text-[13px] text-ink-muted">
                                Hoja de cálculo con encabezados
                            </span>
                        </span>
                    </label>
                </div>
            </fieldset>

            <fieldset className="mt-4">
                <legend className="mb-2 text-[11px] font-semibold tracking-[0.08em] text-ink-muted uppercase">
                    Qué incluir
                </legend>
                <div className="space-y-2">
                    <label className="flex cursor-pointer items-center gap-2 rounded-control border border-line-strong px-3 py-2.5 text-sm has-[:checked]:border-brand has-[:checked]:bg-surface-sunken">
                        <input
                            type="radio"
                            name={`${formId}-scope`}
                            value="all"
                            checked={scope === 'all'}
                            onChange={() => setScope('all')}
                            className="accent-[var(--color-brand)]"
                        />
                        <span className="text-ink">Todos los registros</span>
                        <span className="ml-auto text-[13px] text-ink-muted tabular">
                            {formatNumber(allCount)}
                        </span>
                    </label>

                    <label className="flex cursor-pointer items-center gap-2 rounded-control border border-line-strong px-3 py-2.5 text-sm has-[:checked]:border-brand has-[:checked]:bg-surface-sunken has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60">
                        <input
                            type="radio"
                            name={`${formId}-scope`}
                            value="filtered"
                            checked={scope === 'filtered'}
                            onChange={() => setScope('filtered')}
                            disabled={filteredCount === 0}
                            className="accent-[var(--color-brand)]"
                        />
                        <span className="text-ink">Solo los filtrados</span>
                        <span className="ml-auto text-[13px] text-ink-muted tabular">
                            {formatNumber(filteredCount)}
                        </span>
                    </label>
                </div>
            </fieldset>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                    variant="ghost"
                    onClick={onClose}
                    disabled={submitting}
                    className="w-full sm:w-auto"
                >
                    Cancelar
                </Button>
                <Button
                    variant="primary"
                    onClick={handleExport}
                    disabled={submitting || (scope === 'filtered' && filteredCount === 0)}
                    className="w-full whitespace-nowrap sm:w-auto"
                >
                    <Download size={15} aria-hidden="true" />
                    {submitting ? 'Generando…' : 'Descargar'}
                </Button>
            </div>
        </Dialog>
    );
}
