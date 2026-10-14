import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { COLOR_PALETTE } from '../../data/categories.data';
import * as icons from '../../icons';
import { ProductColor } from '../../models/product';
import { AdminService } from '../../services/admin.service';
import { CatalogService } from '../../services/catalog.service';
import { FcfaPipe } from '../../services/fcfa.pipe';
import { ToastService } from '../../services/toast.service';

const round = (n: number) => Math.round(n / 50) * 50;

@Component({
  selector: 'app-admin-product-form',
  imports: [FormsModule, RouterLink, FaIconComponent, FcfaPipe],
  templateUrl: './admin-product-form.html',
  styleUrl: './admin-product-form.scss',
})
export class AdminProductForm implements OnInit {
  /** Paramètre `:id` (absent pour un nouvel article). */
  readonly id = input<string>();

  private readonly admin = inject(AdminService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  protected readonly catalog = inject(CatalogService);
  protected readonly i = icons;
  protected readonly palette = COLOR_PALETTE;

  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly uploading = signal(0);
  protected readonly error = signal('');

  // Champs du formulaire
  protected readonly images = signal<string[]>([]);
  protected readonly title = signal('');
  protected readonly category = signal('');
  protected readonly price = signal<number | null>(null);
  protected readonly oldPrice = signal<number | null>(null);
  protected readonly stock = signal<number | null>(10);
  protected readonly minOrder = signal<number | null>(1);
  protected readonly description = signal('');
  protected readonly sizes = signal<string[]>([]);
  protected readonly colors = signal<ProductColor[]>([]);
  protected readonly flash = signal(false);
  protected readonly isNew = signal(true);
  protected readonly active = signal(true);
  protected readonly tier10 = signal<number | null>(null);
  protected readonly tier50 = signal<number | null>(null);
  protected readonly customSize = signal('');
  protected readonly customColorName = signal('');
  protected readonly customColorHex = signal('#000000');

  /** Valeurs conservées d'un article existant (note, avis, ventes). */
  private stats = { rating: 5, reviews: 0, sold: 0 };
  private removedImages: string[] = [];
  private tiersTouched = false;

  protected readonly isEdit = computed(() => !!this.id());
  protected readonly suggestedSizes = computed(() => {
    const preset = this.catalog.getCategory(this.category())?.sizes ?? [];
    return [...new Set([...preset, ...this.sizes()])];
  });
  protected readonly uploadSlots = computed(() => Array.from({ length: this.uploading() }));
  /** Couleurs personnalisées (hors palette). */
  protected readonly extraColors = computed(() =>
    this.colors().filter((c) => !this.palette.some((p) => p.name === c.name)),
  );
  protected readonly discount = computed(() => {
    const p = this.price(), o = this.oldPrice();
    return p && o && o > p ? Math.round((1 - p / o) * 100) : 0;
  });

  async ngOnInit(): Promise<void> {
    const id = Number(this.id());
    if (!id) return;
    this.loading.set(true);
    try {
      const p = await this.admin.get(id);
      if (!p) {
        this.error.set('Article introuvable.');
        return;
      }
      this.images.set(p.images);
      this.title.set(p.title);
      this.category.set(p.category);
      this.price.set(p.price);
      this.oldPrice.set(p.oldPrice ?? null);
      this.stock.set(p.stock);
      this.minOrder.set(p.minOrder);
      this.description.set(p.description);
      this.sizes.set(p.sizes ?? []);
      this.colors.set(p.colors ?? []);
      this.flash.set(p.flash);
      this.isNew.set(p.isNew);
      this.active.set(p.active);
      this.tier10.set(p.wholesale.find((t) => t.min === 10)?.price ?? null);
      this.tier50.set(p.wholesale.find((t) => t.min === 50)?.price ?? null);
      this.tiersTouched = true;
      this.stats = { rating: p.rating, reviews: p.reviews, sold: p.sold };
    } catch (e) {
      this.error.set((e as Error).message);
    } finally {
      this.loading.set(false);
    }
  }

  // ---------- Photos ----------
  protected async addPhotos(event: Event): Promise<void> {
    const inputEl = event.target as HTMLInputElement;
    const files = Array.from(inputEl.files ?? []);
    inputEl.value = '';
    for (const file of files) {
      this.uploading.update((n) => n + 1);
      try {
        const url = await this.admin.uploadImage(file);
        this.images.update((list) => [...list, url]);
      } catch (e) {
        this.toast.show('Photo non envoyée : ' + (e as Error).message);
      } finally {
        this.uploading.update((n) => n - 1);
      }
    }
  }

  protected removePhoto(url: string): void {
    this.images.update((list) => list.filter((u) => u !== url));
    this.removedImages.push(url);
  }

  protected makeMain(url: string): void {
    this.images.update((list) => [url, ...list.filter((u) => u !== url)]);
  }

  // ---------- Catégorie / tailles / couleurs ----------
  protected setCategory(slug: string): void {
    this.category.set(slug);
    // Nouvel article : on pré-coche les tailles habituelles de la catégorie.
    if (!this.isEdit()) this.sizes.set([...(this.catalog.getCategory(slug)?.sizes ?? [])]);
  }

  protected toggleSize(size: string): void {
    this.sizes.update((list) => (list.includes(size) ? list.filter((s) => s !== size) : [...list, size]));
  }

  protected addCustomSize(): void {
    const s = this.customSize().trim().toUpperCase();
    if (s && !this.sizes().includes(s)) this.sizes.update((list) => [...list, s]);
    this.customSize.set('');
  }

  protected hasColor(name: string): boolean {
    return this.colors().some((c) => c.name === name);
  }

  protected toggleColor(color: ProductColor): void {
    this.colors.update((list) =>
      list.some((c) => c.name === color.name) ? list.filter((c) => c.name !== color.name) : [...list, color],
    );
  }

  protected addCustomColor(): void {
    const name = this.customColorName().trim();
    if (name && !this.hasColor(name)) this.colors.update((list) => [...list, { name, hex: this.customColorHex() }]);
    this.customColorName.set('');
  }

  // ---------- Prix ----------
  protected setPrice(value: number | null): void {
    this.price.set(value);
    // Tant que la gérante n'a pas saisi ses prix de gros, on les propose automatiquement.
    if (!this.tiersTouched && value) {
      this.tier10.set(round(value * 0.88));
      this.tier50.set(round(value * 0.78));
    }
  }

  protected setTier(which: 10 | 50, value: number | null): void {
    this.tiersTouched = true;
    (which === 10 ? this.tier10 : this.tier50).set(value);
  }

  // ---------- Enregistrement ----------
  protected async save(): Promise<void> {
    const price = Number(this.price());
    const problems = [
      !this.images().length && 'ajoutez au moins une photo',
      !this.title().trim() && 'indiquez le nom de l\'article',
      !this.category() && 'choisissez une catégorie',
      !(price > 0) && 'indiquez le prix',
    ].filter(Boolean);
    if (problems.length) {
      this.error.set('Pour enregistrer : ' + problems.join(', ') + '.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (this.uploading()) {
      this.error.set('Patientez, des photos sont encore en cours d\'envoi.');
      return;
    }

    const wholesale = [{ min: 1, price }];
    const t10 = Number(this.tier10()), t50 = Number(this.tier50());
    if (t10 > 0) wholesale.push({ min: 10, price: t10 });
    if (t50 > 0) wholesale.push({ min: 50, price: t50 });
    const oldPrice = Number(this.oldPrice());

    this.saving.set(true);
    this.error.set('');
    try {
      await this.admin.save(
        {
          title: this.title().trim(),
          category: this.category(),
          images: this.images(),
          price,
          oldPrice: oldPrice > price ? oldPrice : undefined,
          stock: Math.max(0, Number(this.stock()) || 0),
          minOrder: Math.max(1, Number(this.minOrder()) || 1),
          wholesale,
          sizes: this.sizes(),
          colors: this.colors(),
          description: this.description().trim(),
          flash: this.flash(),
          isNew: this.isNew(),
          active: this.active(),
          ...this.stats,
        },
        Number(this.id()) || undefined,
      );
      // Les photos retirées ne sont effacées du stockage qu'une fois l'article enregistré.
      await Promise.all(this.removedImages.map((url) => this.admin.deleteImage(url).catch(() => undefined)));
      this.toast.show(this.isEdit() ? 'Article modifié' : 'Article ajouté');
      this.router.navigate(['/admin']);
    } catch (e) {
      this.error.set('Erreur lors de l\'enregistrement : ' + (e as Error).message);
    } finally {
      this.saving.set(false);
    }
  }
}
