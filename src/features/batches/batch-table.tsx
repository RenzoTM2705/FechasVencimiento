import { StatusBadge } from '@/components/ui/status-badge';
import { RemovalNotice } from './removal-notice';
import { cn } from '@/lib/cn';
import { describeDays } from '@/lib/expiry';
import { formatDate, formatNumber } from '@/lib/format';
import type { BatchView, ExpiryStatus } from '@/types/domain';

const RAIL: Record<ExpiryStatus, string> = {
    vigente: 'bg-ok',
    proximo: 'bg-warn',
    critico: 'bg-danger',
    vence_hoy: 'bg-danger',
    vencido: 'bg-expired',
};

const HEADERS = ['Encargado', 'Producto', 'Cantidad', 'Vencimiento', 'Días restantes'];

export function BatchTable({ batches }: { batches: BatchView[] }) {
    return (
        <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
            <p className="border-b border-line px-4 py-2 text-center text-[12px] text-ink-muted sm:hidden">
                Desliza la tabla para ver todas las columnas
            </p>
            <div
                role="region"
                aria-label="Tabla de vencimientos"
                tabIndex={0}
                className="overflow-x-auto"
            >
                <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                    <caption className="sr-only">
                        Registros de vencimiento: encargado, producto, cantidad, fecha de
                        vencimiento y días restantes.
                    </caption>
                    <thead>
                        <tr className="bg-surface-sunken">
                            {HEADERS.map((header, index) => (
                                <th
                                    key={header}
                                    scope="col"
                                    className={cn(
                                        'px-3 py-2.5 text-[11px] font-semibold tracking-[0.08em] text-ink-muted uppercase',
                                        index === 0 && 'pl-4',
                                        index === 2 && 'text-right',
                                        index === 4 && 'pr-4',
                                    )}
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {batches.map((batch) => (
                            <tr
                                key={batch.id}
                                className="border-t border-line transition-colors hover:bg-surface-sunken/60"
                            >
                                <td className="py-3 pr-3 pl-4">
                                    <div className="flex items-center gap-3">
                                        <span
                                            aria-hidden="true"
                                            className={cn(
                                                'h-7 w-[3px] shrink-0 rounded-full',
                                                RAIL[batch.status],
                                            )}
                                        />
                                        <span className="font-medium text-ink">
                                            {batch.responsibleName}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-3 py-3 font-medium text-ink">
                                    {batch.productName}
                                </td>
                                <td className="px-3 py-3 text-right text-ink-soft tabular">
                                    {formatNumber(batch.quantity)}
                                </td>
                                <td className="px-3 py-3 text-ink-soft tabular">
                                    {formatDate(batch.expirationDate)}
                                </td>
                                <td className="py-3 pr-4 pl-3">
                                    <div className="flex flex-col items-start gap-1">
                                        <span
                                            className={cn(
                                                'font-semibold tabular',
                                                batch.daysRemaining <= 0
                                                    ? 'text-danger'
                                                    : 'text-ink',
                                            )}
                                        >
                                            {describeDays(batch.daysRemaining)}
                                        </span>
                                        <StatusBadge status={batch.status} />
                                        <RemovalNotice
                                            days={batch.daysRemaining}
                                            status={batch.status}
                                            className="mt-0.5"
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
