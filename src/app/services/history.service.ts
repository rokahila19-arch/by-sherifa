import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { Product } from '../models/product';
import { CatalogService } from './catalog.service';
import { loadJson, saveJson } from './storage';

/** Articles récemment consultés (comme « Vus récemment » sur Shein). */
@Injectable({ providedIn: 'root' })
export class HistoryService {
  private readonly catalog = inject(CatalogService);
  private readonly ids = signal<number[]>(loadJson('sc-history', []));
  readonly products = computed(() =>
    this.ids()
      .map((id) => this.catalog.getProduct(id))
      .filter((p): p is Product => !!p),
  );

  constructor() {
    effect(() => saveJson('sc-history', this.ids()));
  }

  track(id: number): void {
    this.ids.update((ids) => [id, ...ids.filter((i) => i !== id)].slice(0, 20));
  }
}
