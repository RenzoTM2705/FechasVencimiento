import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { cn } from '@/lib/cn';
import { describeDays } from '@/lib/expiry';
import { formatDate, formatNumber, formatUnits } from '@/lib/format';
import type { ProductGroup } from '@/lib/grouping';
import type { BatchView, ExpiryStatus } from '@/types/domain';
import { RecordActions } from './record-actions';
import { RemovalNotice } from './removal-notice';

const RAIL: Record<ExpiryStatus, string> = {
    vigente: 'bg-ok',
    proximo: 'bg-warn',
    critico: 'bg-danger',
    vence_hoy: 'bg-danger',
    vencido: 'bg-expired',
};

const INITIAL_VISIBLE = 3;

function BatchRow({
    batch,
    onEdit,
    onDelete,
}: {
    batch: BatchView;
    onEdit: (batch: BatchView) => void;
    onDelete: (batch: BatchView) => void;
}) {
    return (
        <li className="flex items-start gap-3 py-2.5">
            <span
                aria-hidden="true"
                className={cn('mt-1 h-8 w-[3px] shrink-0 rounded-full', RAIL[batch.status])}
            />
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <p className="text-sm font-semibold text-ink tabular">
                        {formatDate(batch.expirationDate)}
                    </p>
                    <div className="flex items-center gap-1">
                        <StatusBadge status={batch.status} />
                        <RecordActions
                            batch={batch}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            className="-my-1"
                        />
                    </div>
                </div>
                <p className="mt-0.5 text-[13px] text-ink-soft">
                    {formatUnits(batch.quantity)} · {batch.responsibleName} ·{' '}
                    <span
                        className={cn(
                            'font-medium',
                            batch.daysRemaining <= 0 ? 'text-danger' : 'text-ink-soft',
                        )}
                    >
                        {describeDays(batch.daysRemaining)}
                    </span>
                </p>
                {batch.daysRemaining <= 0 ? (
                    <RemovalNotice
                        days={batch.daysRemaining}
                        status={batch.status}
                        className="mt-1.5"
                    />
                ) : null}
            </div>
        </li>
    );
}

function ProductCard({
    group,
    onEdit,
    onDelete,
}: {
    group: ProductGroup;
    onEdit: (batch: BatchView) => void;
    onDelete: (batch: BatchView) => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const visible = expanded ? group.batches : group.batches.slice(0, INITIAL_VISIBLE);
    const hiddenCount = group.batches.length - INITIAL_VISIBLE;

    return (
        <article className="flex flex-col rounded-card border border-line bg-surface shadow-card">
            <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
                <h3 className="text-[17px] leading-snug font-semibold text-ink">
                    {group.productName}
                </h3>
                <span className="shrink-0 rounded-[10px] border border-line bg-surface-sunken px-2 py-0.5 text-[12px] font-medium text-ink-soft tabular">
                    {group.batches.length}{' '}
                    {group.batches.length === 1 ? 'registro' : 'registros'}
                </span>
            </div>

            <ul className="flex-1 divide-y divide-line px-4">
                {visible.map((batch) => (
                    <BatchRow
                        key={batch.id}
                        batch={batch}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </ul>

            {hiddenCount > 0 ? (
                <div className="mt-auto border-t border-line px-4 py-2.5">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-[12px] text-ink-muted">
                            {expanded
                                ? `${formatNumber(group.batches.length)} registros visibles`
                                : `+ ${hiddenCount} vencimientos adicionales`}
                        </p>
                        <Button
                            variant="ghost"
                            size="sm"
                            aria-expanded={expanded}
                            onClick={() => setExpanded((value) => !value)}
                        >
                            {expanded ? (
                                <>
                                    Ver menos
                                    <ChevronUp size={14} aria-hidden="true" />
                                </>
                            ) : (
                                <>
                                    Ver todos
                                    <ChevronDown size={14} aria-hidden="true" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            ) : null}
        </article>
    );
}

export function BatchCards({
    groups,
    onEdit,
    onDelete,
}: {
    groups: ProductGroup[];
    onEdit: (batch: BatchView) => void;
    onDelete: (batch: BatchView) => void;
}) {
    return (
        <div className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {groups.map((group) => (
                <ProductCard
                    key={group.productId}
                    group={group}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}
