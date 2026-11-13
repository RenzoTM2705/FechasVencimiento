-- ============================================================
-- 0004_crud.sql — Edición de registros
-- ============================================================
-- `update_batch` edita un registro existente resolviendo (o creando) el
-- producto del catálogo, igual que `register_batches`. La eliminación se hace
-- por PostgREST (RLS permite DELETE a authenticated).
--
-- Códigos nuevos: BATCH_NOT_FOUND.
-- ============================================================

create or replace function public.update_batch(
    p_id uuid,
    p_responsible text,
    p_product_name text,
    p_quantity integer,
    p_expiration_date date
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
    v_norm text;
    v_product_id uuid;
begin
    if btrim(coalesce(p_responsible, '')) = '' then
        raise exception 'RESPONSIBLE_REQUIRED' using errcode = 'P0001';
    end if;

    if char_length(btrim(p_responsible)) > 80 then
        raise exception 'RESPONSIBLE_TOO_LONG' using errcode = 'P0001';
    end if;

    v_norm := public.normalize_product_name(p_product_name);

    if v_norm = '' then
        raise exception 'PRODUCT_REQUIRED' using errcode = 'P0001';
    end if;

    if char_length(btrim(p_product_name)) > 120 then
        raise exception 'PRODUCT_TOO_LONG' using errcode = 'P0001';
    end if;

    if p_quantity is null or p_quantity <= 0 then
        raise exception 'INVALID_QUANTITY' using errcode = 'P0001';
    end if;

    if p_expiration_date is null then
        raise exception 'INVALID_DATE' using errcode = 'P0001';
    end if;

    v_product_id := null;

    insert into public.products (name)
    values (btrim(p_product_name))
    on conflict (normalized_name) do nothing
    returning id into v_product_id;

    if v_product_id is null then
        select id into v_product_id
        from public.products
        where normalized_name = v_norm;
    end if;

    update public.product_batches
       set product_id = v_product_id,
           responsible_name = btrim(p_responsible),
           quantity = p_quantity,
           expiration_date = p_expiration_date
     where id = p_id;

    if not found then
        raise exception 'BATCH_NOT_FOUND' using errcode = 'P0001';
    end if;
end;
$$;

revoke all on function public.update_batch(uuid, text, text, integer, date) from public;
revoke all on function public.update_batch(uuid, text, text, integer, date) from anon;
grant execute on function public.update_batch(uuid, text, text, integer, date) to authenticated;
