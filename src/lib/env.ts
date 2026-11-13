/**
 * Lectura y validación de variables de entorno.
 *
 * Falla con un mensaje claro (y sin exponer valores) cuando falta configuración.
 * La `anon key` es pública por diseño; la seguridad real la aporta RLS en Supabase.
 */

export interface AppEnv {
    supabaseUrl: string;
    supabaseAnonKey: string;
}

let cached: AppEnv | null = null;

export function missingEnvVars(): string[] {
    const missing: string[] = [];
    if (!import.meta.env.VITE_SUPABASE_URL?.trim()) missing.push('VITE_SUPABASE_URL');
    if (!import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()) missing.push('VITE_SUPABASE_ANON_KEY');
    return missing;
}

export function isConfigured(): boolean {
    return missingEnvVars().length === 0;
}

export function readEnv(): AppEnv {
    if (cached) return cached;

    const missing = missingEnvVars();
    if (missing.length > 0) {
        throw new Error(
            `Falta configuración del entorno: ${missing.join(', ')}. Copia .env.example a .env.local y completa los valores.`,
        );
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!.trim();
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!.trim();

    // Freno explícito: la service_role key nunca debe llegar al navegador.
    if (/service[_-]?role/i.test(supabaseAnonKey)) {
        throw new Error(
            'La clave configurada parece ser service_role y expone toda la base de datos. Usa la anon key pública.',
        );
    }

    cached = { supabaseUrl, supabaseAnonKey };
    return cached;
}
