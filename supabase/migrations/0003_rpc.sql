-- ============================================================
-- 0003_rpc.sql — Alta transaccional de registros
-- ============================================================
-- `register_batches` es el único camino de escritura del alta (individual y
-- grupal). Todo ocurre en una transacción: si una fila falla, no se guarda
-- ninguna. `security invoker` mantiene RLS activa.
--
-- Códigos de error estables que el frontend traduce (src/lib/errors.ts):
--   RESPONSIBLE_REQUIRED · ROWS_REQUIRED · PRODUCT_REQUIRED
--   INVALID_QUANTITY · INVALID_DATE
-- ============================================================

create or replace function public.register_batches(
    p_responsible text,
    p_rows jsonb
)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
    v_store uuid := public.current_store_id();
    v_row record;
    v_norm text;
    v_product_id uuid;
    v_count integer := 0;
begin
    if btrim(coalesce(p_responsible, '')) = '' then
        raise exception 'RESPONSIBLE_REQUIRED' using errcode = 'P0001';
    end if;

    if char_length(btrim(p_responsible)) > 80 then
        raise exception 'RESPONSIBLE_TOO_LONG' using errcode = 'P0001';
    end if;

    if p_rows is null
        or jsonb_typeof(p_rows) <> 'array'
        or jsonb_array_length(p_rows) = 0
    then
        raise exception 'ROWS_REQUIRED' using errcode = 'P0001';
    end if;

    for v_row in
        select *
        from jsonb_to_recordset(p_rows)
            as x (product_name text, quantity integer, expiration_date date)
    loop
        v_norm := public.normalize_product_name(v_row.product_name);

        if v_norm = '' then
            raise exception 'PRODUCT_REQUIRED' using errcode = 'P0001';
        end if;

        if char_length(btrim(v_row.product_name)) > 120 then
            raise exception 'PRODUCT_TOO_LONG' using errcode = 'P0001';
        end if;

        if v_row.quantity is null or v_row.quantity <= 0 then
            raise exception 'INVALID_QUANTITY' using errcode = 'P0001';
        end if;

        if v_row.expiration_date is null then
            raise exception 'INVALID_DATE' using errcode = 'P0001';
        end if;

        -- Se reinicia para no reutilizar el id de una fila anterior cuando el
        -- producto ya existe y el insert no devuelve nada.
        v_product_id := null;

        insert into public.products (name)
        values (btrim(v_row.product_name))
        on conflict (normalized_name) do nothing
        returning id into v_product_id;

        if v_product_id is null then
            select id into v_product_id
            from public.products
            where normalized_name = v_norm;
        end if;

        insert into public.product_batches
            (store_id, product_id, responsible_name, quantity, expiration_date)
        values
            (v_store, v_product_id, btrim(p_responsible), v_row.quantity, v_row.expiration_date);

        v_count := v_count + 1;
    end loop;

    return v_count;
end;
$$;

-- Solo usuarios autenticados pueden ejecutarla.
revoke all on function public.register_batches(text, jsonb) from public;
revoke all on function public.register_batches(text, jsonb) from anon;
grant execute on function public.register_batches(text, jsonb) to authenticated;

-- ------------------------------------------------------------
-- Comprobación rápida (ejecutar en el SQL Editor)
-- ------------------------------------------------------------
-- select proname, prosecdef
-- from pg_proc
-- where proname = 'register_batches';
--
-- prosecdef debe ser false (security invoker).
