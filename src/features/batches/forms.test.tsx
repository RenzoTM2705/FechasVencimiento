import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { BatchFormDialog } from './batch-form-dialog';
import { BulkFormDialog } from './bulk-form-dialog';

/**
 * jsdom no implementa `showModal`/`close`; se simulan para poder probar los
 * diálogos (el foco atrapado lo aporta el navegador real).
 */
beforeAll(() => {
    HTMLDialogElement.prototype.showModal = function showModal() {
        this.setAttribute('open', '');
    };
    HTMLDialogElement.prototype.close = function close() {
        this.removeAttribute('open');
        this.dispatchEvent(new Event('close'));
    };
});

describe('BatchFormDialog', () => {
    it('muestra los errores y no envía un formulario vacío', () => {
        const onSubmit = vi.fn().mockResolvedValue(undefined);

        render(<BatchFormDialog catalog={[]} onClose={vi.fn()} onSubmit={onSubmit} />);
        fireEvent.click(screen.getByRole('button', { name: 'Guardar producto' }));

        expect(screen.getByText('Ingresa el nombre del encargado.')).toBeInTheDocument();
        expect(screen.getByText('Ingresa el nombre del producto.')).toBeInTheDocument();
        expect(screen.getByText('Ingresa la cantidad.')).toBeInTheDocument();
        expect(screen.getByText('Selecciona una fecha de vencimiento.')).toBeInTheDocument();
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('envía los valores recortados cuando el formulario es válido', async () => {
        const onSubmit = vi.fn().mockResolvedValue(undefined);

        render(<BatchFormDialog catalog={[]} onClose={vi.fn()} onSubmit={onSubmit} />);

        fireEvent.change(screen.getByLabelText('Encargado'), {
            target: { value: '  Carlos ' },
        });
        fireEvent.change(screen.getByLabelText('Producto'), {
            target: { value: ' Leche Gloria ' },
        });
        fireEvent.change(screen.getByLabelText('Cantidad'), { target: { value: '10' } });
        fireEvent.change(screen.getByLabelText('Vencimiento'), {
            target: { value: '2026-12-01' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Guardar producto' }));

        await waitFor(() =>
            expect(onSubmit).toHaveBeenCalledWith({
                responsibleName: 'Carlos',
                productName: 'Leche Gloria',
                quantity: 10,
                expirationDate: '2026-12-01',
            }),
        );
    });
});

describe('BulkFormDialog', () => {
    it('añade y quita filas manteniendo el encargado', () => {
        render(<BulkFormDialog catalog={[]} onClose={vi.fn()} onSubmit={vi.fn()} />);

        expect(screen.getByText('Producto 1')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Añadir otro producto' }));
        expect(screen.getByText('Producto 2')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Quitar producto 2' }));
        expect(screen.queryByText('Producto 2')).not.toBeInTheDocument();
    });

    it('no permite guardar si una fila está incompleta', () => {
        const onSubmit = vi.fn();

        render(<BulkFormDialog catalog={[]} onClose={vi.fn()} onSubmit={onSubmit} />);
        fireEvent.change(screen.getByLabelText('Encargado'), { target: { value: 'María' } });
        fireEvent.click(screen.getByRole('button', { name: 'Guardar producto' }));

        expect(
            screen.getByText('Revisa los campos marcados. No se guardó ningún producto.'),
        ).toBeInTheDocument();
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('envía todas las filas con el mismo encargado', async () => {
        const onSubmit = vi.fn().mockResolvedValue(undefined);

        render(<BulkFormDialog catalog={[]} onClose={vi.fn()} onSubmit={onSubmit} />);

        fireEvent.change(screen.getByLabelText('Encargado'), { target: { value: 'Carlos' } });
        fireEvent.change(screen.getByLabelText('Producto'), { target: { value: 'Leche Gloria' } });
        fireEvent.change(screen.getAllByLabelText('Cantidad')[0], { target: { value: '4' } });
        fireEvent.change(screen.getAllByLabelText('Vencimiento')[0], {
            target: { value: '2026-12-10' },
        });

        fireEvent.click(screen.getByRole('button', { name: 'Añadir otro producto' }));
        fireEvent.change(screen.getAllByLabelText('Producto')[1], {
            target: { value: 'Yogurt Laive' },
        });
        fireEvent.change(screen.getAllByLabelText('Cantidad')[1], { target: { value: '6' } });
        fireEvent.change(screen.getAllByLabelText('Vencimiento')[1], {
            target: { value: '2026-12-20' },
        });

        fireEvent.click(screen.getByRole('button', { name: 'Guardar 2 productos' }));

        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
        expect(onSubmit.mock.calls[0][0]).toEqual([
            {
                responsibleName: 'Carlos',
                productName: 'Leche Gloria',
                quantity: 4,
                expirationDate: '2026-12-10',
            },
            {
                responsibleName: 'Carlos',
                productName: 'Yogurt Laive',
                quantity: 6,
                expirationDate: '2026-12-20',
            },
        ]);
    });
});
