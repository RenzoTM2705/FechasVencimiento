/**
 * Tipos de la base de datos (`public`), escritos a mano a partir de
 * `supabase/migrations/*.sql`. El esquema es pequeño y estable: se mantiene
 * sincronizado con las migraciones en la misma rama que las cambia.
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface StoreRow {
    id: string;
    name: string;
    created_at: string;
}

export interface ProductRow {
    id: string;
    name: string;
    normalized_name: string;
    created_at: string;
}

export interface ProductBatchRow {
    id: string;
    store_id: string;
    product_id: string;
    responsible_name: string;
    quantity: number;
    expiration_date: string;
    created_at: string;
    updated_at: string;
}

export interface Database {
    public: {
        Tables: {
            stores: {
                Row: StoreRow;
                Insert: {
                    id?: string;
                    name: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    created_at?: string;
                };
                Relationships: [];
            };
            products: {
                Row: ProductRow;
                Insert: {
                    id?: string;
                    name: string;
                    normalized_name: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    normalized_name?: string;
                    created_at?: string;
                };
                Relationships: [];
            };
            product_batches: {
                Row: ProductBatchRow;
                Insert: {
                    id?: string;
                    store_id?: string;
                    product_id: string;
                    responsible_name: string;
                    quantity: number;
                    expiration_date: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    store_id?: string;
                    product_id?: string;
                    responsible_name?: string;
                    quantity?: number;
                    expiration_date?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
        };
        Views: Record<string, never>;
        Functions: {
            register_batches: {
                Args: { p_responsible: string; p_rows: Json };
                Returns: number;
            };
        };
        Enums: Record<string, never>;
        CompositeTypes: Record<string, never>;
    };
}
