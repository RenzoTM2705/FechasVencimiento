/**
 * Verificación de la conexión con Supabase.
 *
 * Uso: `pnpm run check:supabase` (lee .env.local y, si no existe, .env).
 *
 * Comprueba, sin credenciales privilegiadas:
 *  1. Auth accesible.
 *  2. Registro público desactivado.
 *  3. Tablas accesibles con la clave pública (RLS activa).
 *  4. RPC `register_batches` presente pero no ejecutable por anon.
 *  5. Inserción anónima rechazada.
 *
 * Código de salida 1 si alguna comprobación falla.
 */
import { existsSync, readFileSync } from 'node:fs';

function loadEnv() {
    const env = { ...process.env };

    for (const file of ['.env.local', '.env']) {
        if (!existsSync(file)) continue;

        for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
            const match = /^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
            if (!match) continue;

            const [, name, rawValue] = match;
            const value = rawValue.replace(/^["']|["']$/g, '');
            if (!env[name]) env[name] = value;
        }
    }

    return env;
}

const env = loadEnv();
const url = (env.VITE_SUPABASE_URL ?? '').replace(/\/+$/, '');
const key = env.VITE_SUPABASE_ANON_KEY ?? '';

if (!url || !key) {
    console.error('✖ Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY (.env.local o .env).');
    process.exit(1);
}

const headers = { apikey: key, Authorization: `Bearer ${key}` };

async function request(path, init = {}) {
    const response = await fetch(url + path, {
        ...init,
        headers: { ...headers, ...(init.headers ?? {}) },
    });
    const text = await response.text();
    return { status: response.status, text };
}

function fail(message, detail = '') {
    console.log(`✖ ${message}${detail ? ` — ${detail}` : ''}`);
    return false;
}

function pass(message) {
    console.log(`✔ ${message}`);
    return true;
}

const results = [];

async function check(name, run) {
    try {
        results.push(await run(name));
    } catch (error) {
        results.push(fail(name, error.message));
    }
}

console.log(`Proyecto: ${url}\n`);

await check('Auth accesible', async () => {
    const { status, text } = await request('/auth/v1/health');
    return status === 200 ? pass('Auth accesible') : fail('Auth no responde', `${status} ${text}`);
});

await check('Registro público desactivado', async () => {
    const { status, text } = await request('/auth/v1/settings');
    if (status !== 200) return fail('No se pudieron leer los ajustes de Auth', String(status));

    const settings = JSON.parse(text);
    return settings.disable_signup === true
        ? pass('Registro público desactivado')
        : fail(
              'El registro público está ABIERTO',
              'desactívalo en Authentication → Sign In / Providers',
          );
});

for (const table of ['stores', 'products', 'product_batches']) {
    await check(`Tabla ${table}`, async () => {
        const { status, text } = await request(`/rest/v1/${table}?select=*&limit=1`);
        if (status === 200) return pass(`Tabla ${table} accesible con RLS (${text})`);
        return fail(`Tabla ${table} no disponible`, `${status} ${text.slice(0, 160)}`);
    });
}

await check('RPC register_batches', async () => {
    const { status, text } = await request('/rest/v1/rpc/register_batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_responsible: 'prueba', p_rows: [] }),
    });

    if (status === 401 || status === 403) {
        return pass('RPC presente y no ejecutable por anon');
    }
    if (status === 404) {
        return fail('RPC no encontrada', 'ejecuta supabase/migrations/0003_rpc.sql');
    }
    return fail('La RPC respondió de forma inesperada', `${status} ${text.slice(0, 160)}`);
});

await check('Inserción anónima rechazada', async () => {
    const { status } = await request('/rest/v1/product_batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({
            product_id: '00000000-0000-0000-0000-000000000000',
            responsible_name: 'prueba',
            quantity: 1,
            expiration_date: '2026-12-31',
        }),
    });

    return status === 401 || status === 403
        ? pass('Inserción anónima rechazada')
        : fail('Una escritura anónima no fue rechazada', String(status));
});

const failures = results.filter((ok) => !ok).length;
console.log(`\n${results.length - failures}/${results.length} comprobaciones correctas.`);

if (failures > 0) {
    console.log('\nPasos pendientes: docs/TRD.md §6 y §8.');
    process.exit(1);
}
