import { Injectable, signal } from '@angular/core';
import { createClient, Session, SupabaseClient } from '@supabase/supabase-js';
import { Product } from '../models/product';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './supabase.config';

/** Ligne de la table `products` (colonnes snake_case). */
export interface ProductRow {
  id: number;
  title: string;
  category: string;
  brand: string | null;
  images: string[];
  price: number;
  old_price: number | null;
  rating: number;
  reviews: number;
  sold: number;
  stock: number;
  min_order: number;
  wholesale: Product['wholesale'];
  colors: Product['colors'] | null;
  sizes: string[] | null;
  description: string;
  flash: boolean;
  is_new: boolean;
  active: boolean;
}

export type ProductInput = Omit<Product, 'id'> & { active: boolean };

export const BUCKET = 'product-images';

export function rowToProduct(r: ProductRow): Product & { active: boolean } {
  return {
    id: r.id,
    title: r.title,
    category: r.category,
    brand: r.brand ?? undefined,
    images: r.images ?? [],
    price: r.price,
    oldPrice: r.old_price ?? undefined,
    rating: Number(r.rating),
    reviews: r.reviews,
    sold: r.sold,
    stock: r.stock,
    minOrder: r.min_order,
    wholesale: r.wholesale ?? [],
    colors: r.colors?.length ? r.colors : undefined,
    sizes: r.sizes?.length ? r.sizes : undefined,
    description: r.description,
    flash: r.flash,
    isNew: r.is_new,
    active: r.active,
  };
}

export function productToRow(p: ProductInput): Omit<ProductRow, 'id'> {
  return {
    title: p.title,
    category: p.category,
    brand: p.brand || null,
    images: p.images,
    price: p.price,
    old_price: p.oldPrice || null,
    rating: p.rating,
    reviews: p.reviews,
    sold: p.sold,
    stock: p.stock,
    min_order: p.minOrder,
    wholesale: p.wholesale,
    colors: p.colors?.length ? p.colors : null,
    sizes: p.sizes?.length ? p.sizes : null,
    description: p.description,
    flash: p.flash,
    is_new: p.isNew,
    active: p.active,
  };
}

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  readonly enabled = !!(SUPABASE_URL && SUPABASE_ANON_KEY);
  readonly client: SupabaseClient | null = this.enabled
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

  readonly session = signal<Session | null>(null);
  /** Résolu une fois la session restaurée (utile pour le guard). */
  readonly ready: Promise<void>;

  constructor() {
    this.ready = this.client
      ? this.client.auth.getSession().then(({ data }) => {
          this.session.set(data.session);
          this.client!.auth.onAuthStateChange((_event, s) => this.session.set(s));
        })
      : Promise.resolve();
  }

  requireClient(): SupabaseClient {
    if (!this.client) throw new Error('Supabase n\'est pas configuré (src/app/services/supabase.config.ts).');
    return this.client;
  }
}
