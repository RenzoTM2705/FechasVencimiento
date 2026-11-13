-- ============================================================
-- 0002_rls.sql — Row Level Security
-- ============================================================
-- Regla: solo usuarios autenticados acceden a los datos. `anon` no tiene
-- ninguna política, así que no puede leer ni escribir nada aunque conozca la
-- anon key (que es pública por diseño).
--
-- El registro público está desactivado en Supabase Auth; el único usuario es
-- el administrador creado a mano. Cuando existan roles, estas políticas se
-- sustituirán por comprobaciones de pertenencia (ver docs/TRD.md).
-- ============================================================

alter table public.stores enable row level security;
alter table public.products enable row level security;
alter table public.product_batches enable row level security;

-- ------------------------------------------------------------
-- stores
-- ------------------------------------------------------------
drop policy if exists stores_select_authenticated on public.stores;
create policy stores_select_authenticated
    on public.stores
    for select
    to authenticated
    using (true);

-- ------------------------------------------------------------
-- products (catálogo)
-- ------------------------------------------------------------
drop policy if exists products_select_authenticated on public.products;
create policy products_select_authenticated
    on public.products
    for select
    to authenticated
    using (true);

drop policy if exists products_insert_authenticated on public.products;
create policy products_insert_authenticated
    on public.products
    for insert
    to authenticated
    with check (true);

drop policy if exists products_update_authenticated on public.products;
create policy products_update_authenticated
    on public.products
    for update
    to authenticated
    using (true)
    with check (true);

-- Sin política de DELETE: el catálogo no se borra desde la aplicación.

-- ------------------------------------------------------------
-- product_batches (registros de vencimiento)
-- ------------------------------------------------------------
drop policy if exists batches_select_authenticated on public.product_batches;
create policy batches_select_authenticated
    on public.product_batches
    for select
    to authenticated
    using (true);

drop policy if exists batches_insert_authenticated on public.product_batches;
create policy batches_insert_authenticated
    on public.product_batches
    for insert
    to authenticated
    with check (true);

drop policy if exists batches_update_authenticated on public.product_batches;
create policy batches_update_authenticated
    on public.product_batches
    for update
    to authenticated
    using (true)
    with check (true);

drop policy if exists batches_delete_authenticated on public.product_batches;
create policy batches_delete_authenticated
    on public.product_batches
    for delete
    to authenticated
    using (true);

-- ------------------------------------------------------------
-- Comprobación rápida (ejecutar en el SQL Editor)
-- ------------------------------------------------------------
-- select tablename, rowsecurity
-- from pg_tables
-- where schemaname = 'public';
--
-- Las tres tablas deben devolver rowsecurity = true.
