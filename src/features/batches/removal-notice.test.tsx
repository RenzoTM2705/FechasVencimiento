import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RemovalNotice } from './removal-notice';

describe('RemovalNotice', () => {
    it('no muestra nada si el producto aún no vence', () => {
        const { container } = render(<RemovalNotice days={1} status="critico" />);
        expect(container).toBeEmptyDOMElement();
    });

    it('avisa el retiro cuando vence hoy', () => {
        render(<RemovalNotice days={0} status="vence_hoy" />);

        expect(screen.getByText(/fecha cumplida, retirar inmediatamente/i)).toBeInTheDocument();
    });

    it('usa el mismo aviso cuando ya venció', () => {
        render(<RemovalNotice days={-4} status="vencido" />);

        expect(screen.getByText(/fecha cumplida, retirar inmediatamente/i)).toBeInTheDocument();
        expect(screen.queryByText(/vence hoy/i)).not.toBeInTheDocument();
    });
});
