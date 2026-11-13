import { useState } from 'react';
import { CircleAlert, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { toFriendlyMessage } from '@/lib/errors';
import { describeDays } from '@/lib/expiry';
import { formatDate, formatUnits } from '@/lib/format';
import type { BatchView } from '@/types/domain';

export interface DeleteDialogProps {
    batch: BatchView;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}

export function DeleteDialog({ batch, onClose, onConfirm }: DeleteDialogProps) {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleConfirm() {
        setSubmitting(true);
        setError(null);
        try {
            await onConfirm();
        } catch (cause) {
            setError(toFriendlyMessage(cause));
            setSubmitting(false);
        }
    }

    return (
        <Dialog
            title="Eliminar registro"
            description="Esta acción afecta solo a este registro."
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

            <p className="text-sm text-ink">
                ¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede
                deshacer.
            </p>

            <dl className="mt-4 space-y-2 rounded-control border border-line bg-surface-sunken/60 px-3 py-2.5 text-sm">
                <div className="flex justify-between gap-3">
                    <dt className="text-ink-muted">Producto</dt>
                    <dd className="text-right font-medium text-ink">{batch.productName}</dd>
                </div>
                <div className="flex justify-between gap-3">
                    <dt className="text-ink-muted">Encargado</dt>
                    <dd className="text-right font-medium text-ink">{batch.responsibleName}</dd>
                </div>
                <div className="flex justify-between gap-3">
                    <dt className="text-ink-muted">Cantidad</dt>
                    <dd className="text-right font-medium text-ink tabular">
                        {formatUnits(batch.quantity)}
                    </dd>
                </div>
                <div className="flex justify-between gap-3">
                    <dt className="text-ink-muted">Vencimiento</dt>
                    <dd className="text-right font-medium text-ink tabular">
                        {formatDate(batch.expirationDate)} · {describeDays(batch.daysRemaining)}
                    </dd>
                </div>
            </dl>

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
                    variant="danger"
                    onClick={handleConfirm}
                    disabled={submitting}
                    className="w-full whitespace-nowrap sm:w-auto"
                >
                    <Trash2 size={15} aria-hidden="true" />
                    {submitting ? 'Eliminando…' : 'Eliminar registro'}
                </Button>
            </div>
        </Dialog>
    );
}
