-- ============================================================
-- 0001_core.sql — Esquema base de Control de Vencimientos
-- ============================================================
-- Orden de ejecución en el SQL Editor de Supabase:
--   1. 0001_core.sql
--   2. 0002_rls.sql
--   3. 0003_rpc.sql
--
-- Idempotente: se puede volver a ejecutar sin duplicar datos.
-- ============================================================

-- ------------------------------------------------------------
-- Tiendas (preparado para multi-tienda; v1 usa una sola)
-- ------------------------------------------------------------
create table if not exists public.stores (
    id uuid primary key default gen_random_uuid(),
    name text not null check (char_length(btrim(name)) between 1 and 80),
    created_at timestamptz not null default now()
);

insert into public.stores (id, name)
values ('00000000-0000-0000-0000-000000000001', 'Tienda principal')
on conflict (id) do nothing;

-- Identificador de la tienda activa. El frontend no lo envía: las políticas y
-- las altas lo resuelven aquí, y en el futuro pasará a ser un parámetro.
create or replace function public.current_store_id()
returns uuid
language sql
stable
set search_path = public
as $$
    select id from public.stores order by created_at, id limit 1;
$$;

-- ------------------------------------------------------------
-- Catálogo de productos
-- ------------------------------------------------------------
create table if not exists public.products (
    id uuid primary key default gen_random_uuid(),
    name text not null check (char_length(btrim(name)) between 1 and 120),
    normalized_name text not null,
    created_at timestamptz not null default now(),
    constraint products_normalized_name_key unique (normalized_name)
);

-- Normalización: minúsculas, sin acentos latinos y con espacios colapsados.
-- Se implementa con translate() para no depender de la extensión unaccent:
-- es IMMUTABLE (apto para restricciones e índices) y no depende de search_path.
create or replace function public.normalize_product_name(p_name text)
returns text
language sql
immutable
as $$
    select btrim(
        regexp_replace(
            translate(
                lower(coalesce(p_name, '')),
                'áàäâãéèëêíìïîóòöôõúùüûñç',
                'aaaaaeeeeiiiiooooouuuunc'
            ),
            '\s+',
            ' ',
            'g'
        )
    );
$$;

create or replace function public.products_set_normalized_name()
returns trigger
language plpgsql
as $$
begin
    new.normalized_name := public.normalize_product_name(new.name);

    if new.normalized_name = '' then
        raise exception 'PRODUCT_NAME_REQUIRED' using errcode = 'P0001';
    end if;

    return new;
end;
$$;

drop trigger if exists products_normalize_name on public.products;
create trigger products_normalize_name
before insert or update of name on public.products
for each row execute function public.products_set_normalized_name();

-- ------------------------------------------------------------
-- Registros de vencimiento (lotes)
-- ------------------------------------------------------------
-- Cada fila es un registro independiente: el mismo producto puede aparecer
-- varias veces con fechas, cantidades y encargados distintos.
create table if not exists public.product_batches (
    id uuid primary key default gen_random_uuid(),
    store_id uuid not null default public.current_store_id()
        references public.stores (id) on delete restrict,
    product_id uuid not null references public.products (id) on delete restrict,
    responsible_name text not null
        check (char_length(btrim(responsible_name)) between 1 and 80),
    quantity integer not null check (quantity > 0),
    expiration_date date not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists product_batches_store_expiration_idx
    on public.product_batches (store_id, expiration_date);
create index if not exists product_batches_product_idx
    on public.product_batches (product_id);
create index if not exists product_batches_responsible_idx
    on public.product_batches (store_id, responsible_name);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at := now();
    return new;
end;
$$;

drop trigger if exists product_batches_set_updated_at on public.product_batches;
create trigger product_batches_set_updated_at
before update on public.product_batches
for each row execute function public.set_updated_at();
