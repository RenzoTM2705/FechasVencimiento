import { LogOut } from 'lucide-react';
import { formatLongDate } from '@/lib/format';
import { Logo } from './logo';

export interface HeaderProps {
    onSignOut?: () => void;
}

export function Header({ onSignOut }: HeaderProps) {
    return (
        <header className="sticky top-0 z-20 border-b border-black/10 bg-brand text-white">
            <div className="mx-auto flex h-14 max-w-[1200px] items-center gap-3 px-4 sm:px-6 lg:px-8">
                <Logo />

                <div className="min-w-0">
                    <p className="truncate text-[15px] leading-tight font-semibold">
                        Control de Vencimientos
                    </p>
                    <p className="hidden truncate text-xs text-white/70 sm:block">Tienda principal</p>
                </div>

                <div className="ml-auto flex items-center gap-2">
                    <p className="hidden text-xs text-white/70 sm:block">{formatLongDate()}</p>
                    {onSignOut ? (
                        <button
                            type="button"
                            onClick={onSignOut}
                            aria-label="Cerrar sesión"
                            className="inline-flex h-9 items-center gap-1.5 rounded-control px-2.5 text-xs font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                        >
                            <LogOut size={15} aria-hidden="true" />
                            <span className="hidden sm:inline">Cerrar sesión</span>
                        </button>
                    ) : null}
                </div>
            </div>
        </header>
    );
}
