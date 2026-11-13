import { cn } from '@/lib/cn';

/**
 * Marca de la tienda (archivo del cliente).
 *
 * `logo-mark.png` es la versión recortada y con fondo transparente de
 * `logo.png`: el azul de la marca se ve directamente sobre el amarillo de la
 * cabecera y sobre fondos claros. `logo.png` se usa en el cargador.
 */
export function Logo({ className }: { className?: string }) {
    return (
        <img
            src="/logo-mark.png"
            alt="Mass"
            width={239}
            height={75}
            className={cn('h-8 w-auto', className)}
        />
    );
}
