import { Injectable } from '@angular/core';
import { CATEGORIES } from '../data/categories.data';
import { PRODUCTS } from '../data/products.data';
import { Category, Product } from '../models/product';

export type SortKey = 'pertinence' | 'prix-asc' | 'prix-desc' | 'ventes' | 'note' | 'nouveautes';

export interface ProductQuery {
  category?: string | null;
  search?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  minRating?: number | null;
  flashOnly?: boolean;
  sort?: SortKey;
}

const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

@Injectable({ providedIn: 'root' })
export class CatalogService {
  readonly categories = CATEGORIES;
  readonly products = PRODUCTS;

  private readonly byId = new Map(PRODUCTS.map((p) => [p.id, p]));

  getProduct(id: number): Product | undefined {
    return this.byId.get(id);
  }

  getCategory(slug: string | null | undefined): Category | undefined {
    return this.categories.find((c) => c.slug === slug);
  }

  flashSales(): Product[] {
    return this.products.filter((p) => p.flash && p.oldPrice);
  }

  newArrivals(): Product[] {
    return this.products.filter((p) => p.isNew);
  }

  bestSellers(limit = 12): Product[] {
    return [...this.products].sort((a, b) => b.sold - a.sold).slice(0, limit);
  }

  similar(product: Product, limit = 12): Product[] {
    return this.products
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, limit);
  }

  query(q: ProductQuery): Product[] {
    const terms = q.search ? normalize(q.search).split(/\s+/).filter(Boolean) : [];
    let list = this.products.filter((p) => {
      if (q.category && p.category !== q.category) return false;
      if (q.minPrice != null && p.price < q.minPrice) return false;
      if (q.maxPrice != null && p.price > q.maxPrice) return false;
      if (q.minRating != null && p.rating < q.minRating) return false;
      if (q.flashOnly && !p.flash) return false;
      if (terms.length) {
        const cat = this.getCategory(p.category)?.name ?? '';
        const hay = normalize(`${p.title} ${p.brand ?? ''} ${cat}`);
        if (!terms.every((t) => hay.includes(t))) return false;
      }
      return true;
    });
    switch (q.sort) {
      case 'prix-asc': list = [...list].sort((a, b) => a.price - b.price); break;
      case 'prix-desc': list = [...list].sort((a, b) => b.price - a.price); break;
      case 'ventes': list = [...list].sort((a, b) => b.sold - a.sold); break;
      case 'note': list = [...list].sort((a, b) => b.rating - a.rating); break;
      case 'nouveautes': list = [...list].sort((a, b) => Number(b.isNew) - Number(a.isNew)); break;
    }
    return list;
  }
}
