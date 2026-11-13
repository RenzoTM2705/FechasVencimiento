import { useId, useState, type FormEvent } from 'react';
import { CircleAlert, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ProductCombobox } from '@/features/products/product-combobox';
import { toFriendlyMessage } from '@/lib/errors';
import {
    validateBulk,
    type BulkDraftRow,
    type FieldErrors,
    type ValidatedBatch,
} from '@/lib/validation';

export interface BulkFormDialogProps {
    catalog: string[];
    onClose: () => void;
    onSubmit: (values: ValidatedBatch[]) => Promise<void>;
}

let rowSequence = 0;

function createRow(): BulkDraftRow {
    rowSequence += 1;
    return { id: `row-${rowSequence}`, productName: '', quantity: '', expirationDate: '' };
}

export function BulkFormDialog({ catalog, onClose, onSubmit }: BulkFormDialogProps) {
    const formId = useId();
    const [responsible, setResponsible] = useState('');
    const [rows, setRows] = useState<BulkDraftRow[]>([createRow()]);
    const [responsibleError, setResponsibleError] = useState<string | null>(null);
    const [rowErrors, setRowErrors] = useState<Record<string, FieldErrors>>({});
    const [summary, setSummary] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    function patchRow(id: string, patch: Partial<BulkDraftRow>) {
        setRows((current) =>
            current.map((row) => (row.id === id ? { ...row, ...patch } : row)),
        );
    }

    function removeRow(id: string) {
        setRows((current) => (current.length === 1 ? current : current.filter((row) => row.id !== id)));
        setRowErrors((current) => {
            const next = { ...current };
            delete next[id];
            return next;
        });
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const result = validateBulk(responsible, rows);
        setResponsibleError(result.responsibleError);
        setRowErrors(result.rowErrors);

        if (!result.values) {
            setSummary('Revisa los campos marcados. No se guardó ningún producto.');
            return;
        }

        setSummary(null);
        setSubmitting(true);
        setFormError(null);
        try {
            await onSubmit(result.values);
        } catch (cause) {
            setFormError(toFriendlyMessage(cause));
            setSubmitting(false);
        }
    }

    return (
        <Dialog
            title="Registrar varios productos"
            description="Un mismo encargado para todos. Cada fila se guarda como un registro independiente."
            onClose={onClose}
        >
            <form onSubmit={handleSubmit} noValidate>
                {summary ? (
                    <p
                        role="alert"
                        className="mb-4 flex items-center gap-2 rounded-control border border-danger-line bg-danger-soft px-3 py-2 text-sm text-danger"
                    >
                        <CircleAlert size={16} aria-hidden="true" />
                        {summary}
                    </p>
                ) : null}

                {formError ? (
                    <p
                        role="alert"
                        className="mb-4 flex items-center gap-2 rounded-control border border-danger-line bg-danger-soft px-3 py-2 text-sm text-danger"
                    >
                        <CircleAlert size={16} aria-hidden="true" />
                        {formError}
                    </p>
                ) : null}

                <Input
                    id={`${formId}-responsible`}
                    label="Encargado"
                    placeholder="Ej.: Carlos"
                    autoComplete="off"
                    maxLength={80}
                    value={responsible}
                    error={responsibleError ?? undefined}
                    onChange={(event) => setResponsible(event.target.value)}
                />

                <div className="mt-4 space-y-3">
                    {rows.map((row, index) => {
                        const errors = rowErrors[row.id] ?? {};
                        return (
                            <fieldset
                                key={row.id}
                                className="rounded-control border border-line bg-surface-sunken/40 p-3"
                            >
                                <legend className="sr-only">Datos del producto {index + 1}</legend>

                                <div className="mb-2 flex items-center justify-between gap-2">
                                    <p className="text-[11px] font-semibold tracking-[0.08em] text-ink-muted uppercase">
                                        Producto {index + 1}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => removeRow(row.id)}
                                        disabled={rows.length === 1}
                                        aria-label={`Quitar producto ${index + 1}`}
                                        className="grid h-8 w-8 place-items-center rounded-control text-ink-muted transition-colors hover:bg-surface hover:text-danger disabled:pointer-events-none disabled:opacity-40"
                                    >
                                        <Trash2 size={15} aria-hidden="true" />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <ProductCombobox
                                        id={`${formId}-${row.id}-product`}
                                        label="Producto"
                                        placeholder="Ej.: Yogurt Laive"
                                        catalog={catalog}
                                        value={row.productName}
                                        error={errors.productName}
                                        onChange={(value) => patchRow(row.id, { productName: value })}
                                    />

                                    <div className="grid grid-cols-2 gap-3">
                                        <Input
                                            id={`${formId}-${row.id}-quantity`}
                                            label="Cantidad"
                                            type="number"
                                            inputMode="numeric"
                                            min={1}
                                            step={1}
                                            value={row.quantity}
                                            error={errors.quantity}
                                            onChange={(event) =>
                                                patchRow(row.id, { quantity: event.target.value })
                                            }
                                        />
                                        <Input
                                            id={`${formId}-${row.id}-expiration`}
                                            label="Vencimiento"
                                            type="date"
                                            value={row.expirationDate}
                                            error={errors.expirationDate}
                                            onChange={(event) =>
                                                patchRow(row.id, {
                                                    expirationDate: event.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            </fieldset>
                        );
                    })}
                </div>

                <div className="mt-3">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setRows((current) => [...current, createRow()])}
                        disabled={submitting}
                    >
                        <Plus size={15} aria-hidden="true" />
                        Añadir otro producto
                    </Button>
                </div>

                <div className="mt-5 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[13px] text-ink-muted">
                        {rows.length} {rows.length === 1 ? 'producto' : 'productos'} · mismo
                        encargado
                    </p>
                    <div className="flex flex-col-reverse gap-2 sm:flex-row">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            disabled={submitting}
                            className="w-full sm:w-auto"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={submitting}
                            className="w-full whitespace-nowrap sm:w-auto"
                        >
                            {submitting
                                ? 'Guardando…'
                                : `Guardar ${rows.length === 1 ? 'producto' : `${rows.length} productos`}`}
                        </Button>
                    </div>
                </div>
            </form>
        </Dialog>
    );
}
