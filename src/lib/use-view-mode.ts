import { useCallback, useEffect, useState } from 'react';
import type { ViewMode } from '@/types/domain';

const STORAGE_KEY = 'fv:view-mode';
const TABLE_QUERY = '(min-width: 768px)';

function readStoredView(): ViewMode | null {
    try {
        const value = window.localStorage.getItem(STORAGE_KEY);
        return value === 'table' || value === 'cards' ? value : null;
    } catch {
        return null;
    }
}

function preferredView(): ViewMode {
    const stored = readStoredView();
    if (stored) return stored;
    return window.matchMedia(TABLE_QUERY).matches ? 'table' : 'cards';
}

/**
 * Vista activa (tabla o tarjetas). La preferencia manual se guarda en
 * `localStorage` — es solo interfaz, nunca datos de negocio.
 */
export function useViewMode(): [ViewMode, (view: ViewMode) => void] {
    const [view, setView] = useState<ViewMode>(preferredView);

    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, view);
        } catch {
            // Modo privado o almacenamiento bloqueado: se mantiene solo en memoria.
        }
    }, [view]);

    const change = useCallback((next: ViewMode) => setView(next), []);

    return [view, change];
}
