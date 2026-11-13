import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_FILTERS } from '@/lib/filters';
import type { BatchFilters } from '@/types/domain';
import { FilterBar } from './filter-bar';

function renderBar(overrides: Partial<BatchFilters> = {}, onChange = vi.fn()) {
    render(
        <FilterBar
            filters={{ ...DEFAULT_FILTERS, ...overrides }}
            responsibleOptions={['Carlos', 'María']}
            productOptions={[{ id: 'p1', name: 'Leche Gloria' }]}
            resultCount={3}
            totalCount={8}
            view="table"
            onChange={onChange}
            onClear={vi.fn()}
            onViewChange={vi.fn()}
        />,
    );

    return onChange;
}

describe('FilterBar', () => {
    it('muestra el contador de resultados y el total', () => {
        renderBar();
        expect(screen.getByText(/de 8 registros/i)).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('activa y desactiva estados con chips', () => {
        const onChange = renderBar({ statuses: ['vencido'] });

        fireEvent.click(screen.getByRole('button', { name: 'Vencido' }));
        expect(onChange).toHaveBeenCalledWith({ statuses: [] });

        fireEvent.click(screen.getByRole('button', { name: 'Crítico' }));
        expect(onChange).toHaveBeenCalledWith({ statuses: ['vencido', 'critico'] });
    });

    it('oculta los filtros avanzados hasta abrirlos', () => {
        renderBar();

        expect(screen.queryByLabelText('Fecha exacta')).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /filtros/i }));

        expect(screen.getByLabelText('Producto')).toBeInTheDocument();
        expect(screen.getByLabelText('Fecha exacta')).toBeInTheDocument();
        expect(screen.getByLabelText('Desde')).toBeInTheDocument();
        expect(screen.getByLabelText('Hasta')).toBeInTheDocument();
        expect(screen.getByLabelText('Próximos')).toBeInTheDocument();
    });

    it('al elegir fecha exacta limpia el rango', () => {
        const onChange = renderBar();
        fireEvent.click(screen.getByRole('button', { name: /filtros/i }));

        fireEvent.change(screen.getByLabelText('Fecha exacta'), {
            target: { value: '2026-12-01' },
        });

        expect(onChange).toHaveBeenCalledWith({
            dateExact: '2026-12-01',
            dateFrom: null,
            dateTo: null,
        });
    });

    it('informa cuántos filtros están activos', () => {
        renderBar({ search: 'leche', statuses: ['critico'] });
        expect(screen.getByRole('button', { name: /^filtros/i })).toHaveTextContent('2');
    });
});
