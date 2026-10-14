import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Product } from '../models/product';
import { CatalogService } from './catalog.service';
import { loadJson, saveJson } from './storage';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly catalog = inject(CatalogService);
  readonly ids = signal<number[]>(loadJson('sc-favorites', []));
  readonly count = computed(() => this.ids().length);
  readonly products = computed(() =>
    this.ids()
      .map((id) => this.catalog.getProduct(id))
      .filter((p): p is Product => !!p),
  );

  constructor() {
    effect(() => saveJson('sc-favorites', this.ids()));
  }

  has(id: number): boolean {
    return this.ids().includes(id);
  }

  toggle(id: number): void {
    this.ids.update((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [id, ...ids]));
  }
}
