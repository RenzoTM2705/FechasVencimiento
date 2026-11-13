import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

export interface DialogProps {
    title: string;
    description?: string;
    onClose: () => void;
    children: ReactNode;
}

/**
 * Diálogo modal basado en `<dialog>` nativo: aporta foco atrapado, fondo
 * inerte, cierre con Escape y compatibilidad con lectores de pantalla sin
 * dependencias externas.
 */
export function Dialog({ title, description, onClose, children }: DialogProps) {
    const ref = useRef<HTMLDialogElement>(null);
    const titleId = useId();

    useEffect(() => {
        const element = ref.current;
        if (!element || element.open) return;

        element.showModal();

        // `showModal` enfoca el primer elemento interactivo (la X). En un
        // formulario, el foco debe ir al primer campo.
        element
            .querySelector<HTMLElement>('input:not([type="hidden"]), select, textarea')
            ?.focus();
    }, []);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const handleCancel = (event: Event) => {
            event.preventDefault();
            onClose();
        };

        element.addEventListener('cancel', handleCancel);
        return () => element.removeEventListener('cancel', handleCancel);
    }, [onClose]);

    return (
        <dialog
            ref={ref}
            aria-labelledby={titleId}
            onClose={onClose}
            onClick={(event) => {
                if (event.target === ref.current) onClose();
            }}
            className="m-auto max-h-[calc(100dvh-2rem)] w-[min(600px,calc(100vw-1.5rem))] overflow-auto rounded-card border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-ink/50"
        >
            <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
                <div className="min-w-0">
                    <h2 id={titleId} className="text-[18px] leading-snug font-semibold text-ink">
                        {title}
                    </h2>
                    {description ? (
                        <p className="mt-0.5 text-sm text-ink-soft">{description}</p>
                    ) : null}
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Cerrar"
                    className="-mt-1 -mr-1 grid h-9 w-9 shrink-0 place-items-center rounded-control text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink"
                >
                    <X size={18} aria-hidden="true" />
                </button>
            </div>

            <div className="px-5 py-4">{children}</div>
        </dialog>
    );
}
