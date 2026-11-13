export function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="mt-12 border-t border-line">
            <div className="mx-auto flex max-w-[1200px] flex-col gap-1 px-4 py-6 text-[13px] text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                <p>
                    <span className="font-medium text-ink-soft">Control de Vencimientos</span> —
                    registra y vigila las fechas de vencimiento de tu tienda.
                </p>
                <p>© {year}</p>
            </div>
        </footer>
    );
}
