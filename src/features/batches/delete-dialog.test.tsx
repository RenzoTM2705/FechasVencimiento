import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { makeBatch } from '@/test/factories';
import { DeleteDialog } from './delete-dialog';

const BATCH = makeBatch({
    productName: 'Leche Gloria',
    responsibleName: 'Carlos',
    quantity: 6,
    expirationDate: '2026-11-10',
    daysRemaining: -3,
});

describe('DeleteDialog', () => {
    it('pide confirmación y muestra el registro afectado', () => {
        render(<DeleteDialog batch={BATCH} onClose={vi.fn()} onConfirm={vi.fn()} />);

        expect(
            screen.getByText(/¿Estás seguro de que deseas eliminar este registro\?/i),
        ).toBeInTheDocument();
        expect(screen.getByText('Leche Gloria')).toBeInTheDocument();
        expect(screen.getByText('Carlos')).toBeInTheDocument();
        expect(screen.getByText('6 unidades')).toBeInTheDocument();
        expect(screen.getByText(/10\/11\/2026 · Venció hace 3 días/)).toBeInTheDocument();
    });

    it('cancela sin eliminar', () => {
        const onClose = vi.fn();
        const onConfirm = vi.fn();

        render(<DeleteDialog batch={BATCH} onClose={onClose} onConfirm={onConfirm} />);
        fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

        expect(onClose).toHaveBeenCalled();
        expect(onConfirm).not.toHaveBeenCalled();
    });

    it('no se cierra al pulsar fuera del diálogo', () => {
        const onClose = vi.fn();

        render(<DeleteDialog batch={BATCH} onClose={onClose} onConfirm={vi.fn()} />);

        const dialog = screen.getByRole('dialog');
        fireEvent.click(dialog);
        fireEvent.mouseDown(dialog);

        expect(onClose).not.toHaveBeenCalled();
    });

    it('confirma la eliminación', async () => {
        const onConfirm = vi.fn().mockResolvedValue(undefined);

        render(<DeleteDialog batch={BATCH} onClose={vi.fn()} onConfirm={onConfirm} />);
        fireEvent.click(screen.getByRole('button', { name: /Eliminar registro/i }));

        await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
    });

    it('muestra un mensaje comprensible si falla', async () => {
        const onConfirm = vi.fn().mockRejectedValue(new Error('Failed to fetch'));

        render(<DeleteDialog batch={BATCH} onClose={vi.fn()} onConfirm={onConfirm} />);
        fireEvent.click(screen.getByRole('button', { name: /Eliminar registro/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent(/conexión/i);
    });
});
