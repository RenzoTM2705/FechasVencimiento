import { useId, useState, type FormEvent } from 'react';
import { CircleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ProductCombobox } from '@/features/products/product-combobox';
import { toFriendlyMessage } from '@/lib/errors';
import { validateBatch, type FieldErrors, type ValidatedBatch } from '@/lib/validation';

export interface BatchFormDialogProps {
    catalog: string[];
    onClose: () => void;
    onSubmit: (value: ValidatedBatch) => Promise<void>;
}

const EMPTY = {
    responsibleName: '',
    productName: '',
    quantity: '',
    expirationDate: '',
};

export function BatchFormDialog({ catalog, onClose, onSubmit }: BatchFormDialogProps) {
    const formId = useId();
    const [draft, setDraft] = useState(EMPTY);
    const [errors, setErrors] = useState<FieldErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const result = validateBatch(draft);
        setErrors(result.errors);
        if (!result.value) return;

        setSubmitting(true);
        setFormError(null);
        try {
            await onSubmit(result.value);
        } catch (cause) {
            setFormError(toFriendlyMessage(cause));
            setSubmitting(false);
        }
    }

    return (
        <Dialog
            title="Registrar producto"
            description="Un producto con su fecha de vencimiento. Puedes registrar el mismo producto varias veces."
            onClose={onClose}
        >
            <form onSubmit={handleSubmit} noValidate>
                {formError ? (
                    <p
                        role="alert"
                        className="mb-4 flex items-center gap-2 rounded-control border border-danger-line bg-danger-soft px-3 py-2 text-sm text-danger"
                    >
                        <CircleAlert size={16} aria-hidden="true" />
                        {formError}
                    </p>
                ) : null}

                <div className="space-y-4">
                    <Input
                        id={`${formId}-responsible`}
                        label="Encargado"
                        placeholder="Ej.: Carlos"
                        autoComplete="off"
                        maxLength={80}
                        value={draft.responsibleName}
                        error={errors.responsibleName}
                        onChange={(event) =>
                            setDraft((current) => ({
                                ...current,
                                responsibleName: event.target.value,
                            }))
                        }
                    />

                    <ProductCombobox
                        id={`${formId}-product`}
                        label="Producto"
                        placeholder="Ej.: Leche Gloria"
                        catalog={catalog}
                        value={draft.productName}
                        error={errors.productName}
                        onChange={(value) =>
                            setDraft((current) => ({ ...current, productName: value }))
                        }
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            id={`${formId}-quantity`}
                            label="Cantidad"
                            type="number"
                            inputMode="numeric"
                            min={1}
                            step={1}
                            value={draft.quantity}
                            error={errors.quantity}
                            onChange={(event) =>
                                setDraft((current) => ({
                                    ...current,
                                    quantity: event.target.value,
                                }))
                            }
                        />
                        <Input
                            id={`${formId}-expiration`}
                            label="Vencimiento"
                            type="date"
                            value={draft.expirationDate}
                            error={errors.expirationDate}
                            onChange={(event) =>
                                setDraft((current) => ({
                                    ...current,
                                    expirationDate: event.target.value,
                                }))
                            }
                        />
                    </div>
                </div>

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
                        type="submit"
                        variant="primary"
                        disabled={submitting}
                        className="w-full whitespace-nowrap sm:w-auto"
                    >
                        {submitting ? 'Guardando…' : 'Guardar producto'}
                    </Button>
                </div>
            </form>
        </Dialog>
    );
}
