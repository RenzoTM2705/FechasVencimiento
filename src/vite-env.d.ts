/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL?: string;
    readonly VITE_SUPABASE_ANON_KEY?: string;
    readonly VITE_MODO_ACCESO?: 'login' | 'publico';
    readonly VITE_ACCESO_DIRECTO?: string;
    readonly VITE_ACCESO_DIRECTO_EMAIL?: string;
    readonly VITE_ACCESO_DIRECTO_PASSWORD?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
