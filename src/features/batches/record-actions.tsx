import { Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { BatchView } from '@/types/domain';

export interface RecordActionsProps {
    batch: BatchView;
    onEdit: (batch: BatchView) => void;
    onDelete: (batch: BatchView) => void;
    className?: string;
}

/**
 * Acciones por registro: editar y eliminar. Botones con etiqueta accesible que
 * incluye producto y fecha, para que un lector de pantalla no tenga que
 * adivinar a qué fila pertenecen.
 */
export function RecordActions({ batch, onEdit, onDelete, className }: RecordActionsProps) {
    const context = `${batch.productName} del ${batch.expirationDate}`;

    return (
        <div className={cn('flex items-center gap-1', className)}>
            <button
                type="button"
                aria-label={`Editar ${context}`}
                onClick={() => onEdit(batch)}
                className="grid h-9 w-9 place-items-center rounded-control text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
            >
                <Pencil size={15} aria-hidden="true" />
            </button>
            <button
                type="button"
                aria-label={`Eliminar ${context}`}
                onClick={() => onDelete(batch)}
                className="grid h-9 w-9 place-items-center rounded-control text-ink-muted transition-colors hover:bg-danger-soft hover:text-danger"
            >
                <Trash2 size={15} aria-hidden="true" />
            </button>
        </div>
    );
}
