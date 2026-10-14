import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { Router, RouterLink } from '@angular/router';
import { ProductCard } from '../components/product-card';
import { CartService, unitPriceFor } from '../services/cart.service';
import { CatalogService } from '../services/catalog.service';
import { FavoritesService } from '../services/favorites.service';
import { FcfaPipe } from '../services/fcfa.pipe';
import { HistoryService } from '../services/history.service';
import { SHOP, whatsappLink } from '../services/shop-info';
import { ToastService } from '../services/toast.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import * as icons from '../icons';


const REVIEWERS = ['Aminata K.', 'Fatou O.', 'Mariam S.', 'Ibrahim T.', 'Awa D.', 'Salif Z.', 'Rasmata B.', 'Issouf C.'];
const COMMENTS = [
  'Très bonne qualité, conforme aux photos. Je recommande !',
  'Livraison rapide à Ouaga, article bien emballé.',
  'Bon rapport qualité/prix, je vais recommander.',
  'Belle matière, la coupe oversize est parfaite. Merci Cherifa !',
  'Conforme à la description, taille correcte.',
  'Service client au top sur WhatsApp, très réactive.',
];

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink, ProductCard, FcfaPipe, FaIconComponent],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail {
  /** Paramètre de route `:id` (withComponentInputBinding). */
  readonly id = input.required<string>();

  protected readonly catalog = inject(CatalogService);
  private readonly cart = inject(CartService);
  private readonly history = inject(HistoryService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  protected readonly favs = inject(FavoritesService);
  protected readonly i = icons;
  protected readonly shop = SHOP;

  protected readonly product = computed(() => this.catalog.getProduct(Number(this.id())));
  protected readonly category = computed(() => this.catalog.getCategory(this.product()?.category));
  protected readonly similar = computed(() => {
    const p = this.product();
    return p ? this.catalog.similar(p) : [];
  });

  protected readonly imageIdx = signal(0);
  protected readonly color = signal<string | undefined>(undefined);
  protected readonly size = signal<string | undefined>(undefined);
  protected readonly qty = signal(1);
  protected readonly tab = signal<'desc' | 'specs' | 'avis'>('desc');
  protected readonly needSize = signal(false);

  protected readonly unitPrice = computed(() => {
    const p = this.product();
    return p ? unitPriceFor(p, this.qty()) : 0;
  });
  protected readonly discount = computed(() => {
    const p = this.product();
    return p?.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  });

  protected readonly reviews = computed(() => {
    const p = this.product();
    if (!p || !p.reviews) return [];
    return Array.from({ length: 4 }, (_, i) => {
      const k = (p.id + i * 3) % 97;
      return {
        name: REVIEWERS[k % REVIEWERS.length],
        rating: k % 5 === 0 ? 4 : 5,
        text: COMMENTS[k % COMMENTS.length],
        date: `${1 + (k % 27)}/${1 + (i % 9)}/2026`,
        variant: [p.colors?.[k % p.colors.length]?.name, p.sizes?.[k % p.sizes.length]].filter(Boolean).join(' / '),
      };
    });
  });

  /** Étoiles pleines / demi / vides pour une note sur 5. */
  protected stars(rating: number): IconDefinition[] {
    return [1, 2, 3, 4, 5].map((n) =>
      rating >= n ? icons.faStar : rating >= n - 0.5 ? icons.faStarHalfStroke : icons.faStarOutline,
    );
  }

  constructor() {
    // Réinitialise la sélection quand on passe d'un produit à l'autre.
    effect(() => {
      const p = this.product();
      this.imageIdx.set(0);
      this.qty.set(1);
      this.size.set(undefined);
      this.needSize.set(false);
      this.color.set(p?.colors?.[0]?.name);
      if (p) this.history.track(p.id);
      window.scrollTo({ top: 0 });
    });
  }

  protected setQty(value: number): void {
    const p = this.product();
    if (!p || Number.isNaN(value)) return;
    this.qty.set(Math.min(Math.max(1, Math.floor(value)), p.stock));
  }

  private validVariant(): boolean {
    const p = this.product();
    if (p?.sizes?.length && !this.size()) {
      this.needSize.set(true);
      this.toast.show('Veuillez choisir une taille');
      return false;
    }
    return true;
  }

  protected addToCart(): void {
    const p = this.product();
    if (!p || !this.validVariant()) return;
    this.cart.add({ productId: p.id, qty: this.qty(), color: this.color(), size: this.size() });
    this.toast.show('Ajouté au panier');
  }

  protected buyNow(): void {
    const p = this.product();
    if (!p || !this.validVariant()) return;
    this.cart.add({ productId: p.id, qty: this.qty(), color: this.color(), size: this.size() });
    this.router.navigate(['/panier']);
  }

  protected whatsapp(): string {
    const p = this.product();
    if (!p) return '';
    const variant = [this.color(), this.size()].filter(Boolean).join(', ');
    return whatsappLink(
      `Bonjour Stock Chine by Cherifa,\nJe suis intéressé(e) par : ${p.title} (réf. ${p.id})` +
        `${variant ? `\nVariante : ${variant}` : ''}\nQuantité : ${this.qty()}\n${location.href}`,
    );
  }

  protected async share(): Promise<void> {
    const p = this.product();
    if (!p) return;
    const data = { title: p.title, text: `${p.title} sur Stock Chine by Cherifa`, url: location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(location.href);
        this.toast.show('Lien copié');
      }
    } catch {
      // Partage annulé par l'utilisateur.
    }
  }
}
