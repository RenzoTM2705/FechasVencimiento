import { formatLongDate } from '@/lib/format';

export function Header() {
    return (
        <header className="sticky top-0 z-20 border-b border-black/10 bg-brand text-white">
            <div className="mx-auto flex h-14 max-w-[1200px] items-center gap-3 px-4 sm:px-6 lg:px-8">
                <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-white/10">
                    <img
                        src="/logo.svg"
                        alt=""
                        width={36}
                        height={36}
                        className="h-9 w-9"
                        aria-hidden="true"
                    />
                </span>

                <div className="min-w-0">
                    <p className="truncate text-[15px] leading-tight font-semibold">
                        Control de Vencimientos
                    </p>
                    <p className="hidden truncate text-xs text-white/70 sm:block">Tienda principal</p>
                </div>

                <p className="ml-auto hidden text-xs text-white/70 sm:block">
                    {formatLongDate()}
                </p>
            </div>
        </header>
    );
}
