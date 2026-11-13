-- ============================================================
-- 0005_modo_publico.sql — ACCESO SIN LOGIN (OPCIONAL Y PELIGROSO)
-- ============================================================
-- ⚠️  NO EJECUTAR SALVO QUE SE ACEPTE EL RIESGO.
--
-- Estas políticas permiten que cualquier persona con la URL y la clave
-- pública (que es pública por diseño) LEA, CREE, EDITE Y BORRE registros.
-- No hay forma de «proteger» un acceso anónimo: sin sesión no hay identidad
-- que autorizar. Es equivalente a publicar la base de datos.
--
-- Se aplica solo si se decide usar `VITE_MODO_ACCESO=publico`.
--
-- Para revertir en cualquier momento:
--   drop policy if exists stores_select_anon on public.stores;
--   drop policy if exists products_select_anon on public.products;
--   drop policy if exists products_insert_anon on public.products;
--   drop policy if exists batches_select_anon on public.product_batches;
--   drop policy if exists batches_insert_anon on public.product_batches;
--   drop policy if exists batches_update_anon on public.product_batches;
--   drop policy if exists batches_delete_anon on public.product_batches;
--   revoke execute on function public.register_batches(text, jsonb) from anon;
--   revoke execute on function public.update_batch(uuid, text, text, integer, date) from anon;
-- ============================================================

drop policy if exists stores_select_anon on public.stores;
create policy stores_select_anon on public.stores
    for select to anon using (true);

drop policy if exists products_select_anon on public.products;
create policy products_select_anon on public.products
    for select to anon using (true);

drop policy if exists products_insert_anon on public.products;
create policy products_insert_anon on public.products
    for insert to anon with check (true);

drop policy if exists batches_select_anon on public.product_batches;
create policy batches_select_anon on public.product_batches
    for select to anon using (true);

drop policy if exists batches_insert_anon on public.product_batches;
create policy batches_insert_anon on public.product_batches
    for insert to anon with check (true);

drop policy if exists batches_update_anon on public.product_batches;
create policy batches_update_anon on public.product_batches
    for update to anon using (true) with check (true);

drop policy if exists batches_delete_anon on public.product_batches;
create policy batches_delete_anon on public.product_batches
    for delete to anon using (true);

grant execute on function public.register_batches(text, jsonb) to anon;
grant execute on function public.update_batch(uuid, text, text, integer, date) to anon;
