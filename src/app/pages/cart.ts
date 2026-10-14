import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartService } from '../services/cart.service';
import { FcfaPipe } from '../services/fcfa.pipe';
import { SHOP, whatsappLink } from '../services/shop-info';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import * as icons from '../icons';


const DELIVERY = [
  { key: 'ouaga', label: 'Ouagadougou (24–48h)', fee: 1000 },
  { key: 'bobo', label: 'Bobo-Dioulasso (2–4 jours)', fee: 2500 },
  { key: 'autre', label: 'Autre ville du Burkina (3–5 jours)', fee: 3500 },
  { key: 'retrait', label: 'Retrait en boutique', fee: 0 },
];
const FREE_SHIPPING_FROM = 50000;

@Component({
  selector: 'app-cart',
  imports: [RouterLink, FormsModule, FcfaPipe, FaIconComponent],
  template: `
    <div class="container page">
      <h1>Mon panier @if (cart.count()) { <small>({{ cart.count() }} articles)</small> }</h1>

      @if (cart.lines().length) {
        <div class="layout">
          <div>
            @if (remaining() > 0) {
              <div class="free"><fa-icon [icon]="i.faTruckFast" /> Plus que <b>{{ remaining() | fcfa }}</b> pour la livraison gratuite à Ouaga !</div>
            } @else {
              <div class="free ok"><fa-icon [icon]="i.faCircleCheck" /> Livraison gratuite à Ouagadougou débloquée !</div>
            }
            @for (l of cart.lines(); track l.productId + (l.color ?? '') + (l.size ?? '')) {
              <article class="line">
                <a [routerLink]="['/produit', l.productId]"><img [src]="l.product.images[0]" [alt]="l.product.title" /></a>
                <div class="body">
                  <a [routerLink]="['/produit', l.productId]" class="title">{{ l.product.title }}</a>
                  @if (l.color || l.size) {
                    <span class="variant">{{ l.color }}{{ l.color && l.size ? ' / ' : '' }}{{ l.size }}</span>
                  }
                  <div class="row">
                    <span class="price">{{ l.unitPrice | fcfa }}</span>
                    @if (l.unitPrice < l.product.price) { <span class="badge badge-gold">Prix de gros</span> }
                  </div>
                  <div class="row">
                    <div class="qty">
                      <button type="button" (click)="cart.setQty(l, l.qty - 1)" aria-label="Diminuer"><fa-icon [icon]="i.faMinus" /></button>
                      <input type="number" [value]="l.qty" min="1" (change)="cart.setQty(l, +$any($event.target).value || 1)" aria-label="Quantité" />
                      <button type="button" (click)="cart.setQty(l, l.qty + 1)" aria-label="Augmenter"><fa-icon [icon]="i.faPlus" /></button>
                    </div>
                    <button type="button" class="del" (click)="cart.remove(l)" aria-label="Supprimer"><fa-icon [icon]="i.faTrashCan" /></button>
                  </div>
                </div>
              </article>
            }
          </div>

          <aside class="summary">
            <h2>Récapitulatif</h2>
            <label>Nom complet
              <input [(ngModel)]="name" name="name" placeholder="Ex : Aminata Ouédraogo" autocomplete="name" />
            </label>
            <label>Téléphone
              <input [(ngModel)]="phone" name="phone" type="tel" placeholder="+226 ..." autocomplete="tel" />
            </label>
            <label>Livraison
              <select [(ngModel)]="delivery" name="delivery">
                @for (d of deliveryOptions; track d.key) { <option [value]="d.key">{{ d.label }}</option> }
              </select>
            </label>
            <label>Adresse / quartier
              <input [(ngModel)]="address" name="address" placeholder="Ex : Ouaga 2000, près de…" autocomplete="street-address" />
            </label>

            <dl>
              <dt>Sous-total</dt><dd>{{ cart.subtotal() | fcfa }}</dd>
              @if (cart.savings() > 0) { <dt>Économies</dt><dd class="save">−{{ cart.savings() | fcfa }}</dd> }
              <dt>Livraison</dt><dd>{{ shipping() ? (shipping() | fcfa) : 'Gratuite' }}</dd>
              <dt class="tot">Total</dt><dd class="tot">{{ total() | fcfa }}</dd>
            </dl>
            <a class="btn btn-wa btn-block" [href]="orderLink()" target="_blank" rel="noopener" (click)="ordered.set(true)"><fa-icon [icon]="i.faWhatsapp" /> Commander via WhatsApp</a>
            <p class="hint">Votre commande sera envoyée à {{ shop.phoneBF }}. Paiement Orange Money, Moov Money ou à la livraison.</p>
            @if (ordered()) {
              <button type="button" class="btn btn-outline btn-block" (click)="cart.clear(); ordered.set(false)">Commande envoyée — vider le panier</button>
            }
          </aside>
        </div>
      } @else {
        <div class="empty">
          <div class="emoji"><fa-icon [icon]="i.faCartShopping" /></div>
          <h3>Votre panier est vide</h3>
          <p>Découvrez nos nouveautés et ventes flash.</p>
          <a routerLink="/" class="btn btn-dark">Continuer mes achats</a>
        </div>
      }
    </div>
  `,
  styles: `
    h1 { font-size: 20px; margin: 16px 0 12px; }
    h1 small { font-size: 13px; color: var(--muted); font-weight: 400; }
    .layout { display: grid; gap: 16px; }
    @media (min-width: 900px) { .layout { grid-template-columns: 1fr 360px; align-items: start; } .summary { position: sticky; top: calc(var(--header-h) + 12px); } }
    .free { background: #fff6ef; color: var(--accent); padding: 10px 12px; border-radius: 8px; font-size: 13px; margin-bottom: 10px; }
    .free.ok { background: #ebf9f0; color: var(--ok); }
    .line { display: flex; gap: 12px; background: #fff; border-radius: var(--radius); padding: 10px; margin-bottom: 10px; }
    .line img { width: 92px; height: 112px; object-fit: cover; border-radius: 6px; background: #f4f4f4; }
    .body { flex: 1; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
    .title { font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .variant { font-size: 12px; color: var(--muted); background: var(--bg); align-self: flex-start; padding: 1px 8px; border-radius: 4px; }
    .row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .del { font-size: 16px; padding: 6px; color: var(--muted); }
    .summary { background: #fff; border-radius: var(--radius); padding: 16px; }
    .summary h2 { margin: 0 0 12px; font-size: 17px; }
    label { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--ink-2); margin-bottom: 10px; }
    input, select { height: 40px; border: 1px solid var(--line); border-radius: 8px; padding: 0 10px; background: #fff; font-size: 14px; }
    dl { display: grid; grid-template-columns: 1fr auto; gap: 8px; margin: 16px 0; }
    dt { color: var(--ink-2); } dd { margin: 0; text-align: right; font-weight: 600; }
    .save { color: var(--ok); }
    .tot { font-size: 17px; font-weight: 800; padding-top: 8px; border-top: 1px solid var(--line); }
    dd.tot { color: var(--brand); }
    .hint { font-size: 12px; color: var(--muted); }
  `,
})
export class Cart {
  protected readonly cart = inject(CartService);
  protected readonly i = icons;
  protected readonly shop = SHOP;
  protected readonly deliveryOptions = DELIVERY;

  protected readonly name = signal('');
  protected readonly phone = signal('');
  protected readonly address = signal('');
  protected readonly delivery = signal('ouaga');
  protected readonly ordered = signal(false);

  protected readonly remaining = computed(() => Math.max(0, FREE_SHIPPING_FROM - this.cart.subtotal()));
  protected readonly shipping = computed(() => {
    const opt = DELIVERY.find((d) => d.key === this.delivery()) ?? DELIVERY[0];
    if (opt.key === 'ouaga' && this.remaining() === 0) return 0;
    return opt.fee;
  });
  protected readonly total = computed(() => this.cart.subtotal() + this.shipping());

  protected readonly orderLink = computed(() => {
    const fcfa = (n: number) => n.toLocaleString('fr-FR').replace(/[  ]/g, ' ') + ' FCFA';
    const lines = this.cart.lines().map((l, i) => {
      const variant = [l.color, l.size].filter(Boolean).join(' / ');
      return `${i + 1}. ${l.product.title} (réf. SC-${l.productId})${variant ? ` [${variant}]` : ''} × ${l.qty} = ${fcfa(l.total)}`;
    });
    const opt = DELIVERY.find((d) => d.key === this.delivery());
    const msg = [
      '*Nouvelle commande — Stock Chine by Cherifa*',
      '',
      ...lines,
      '',
      `Sous-total : ${fcfa(this.cart.subtotal())}`,
      `Livraison : ${opt?.label} — ${this.shipping() ? fcfa(this.shipping()) : 'Gratuite'}`,
      `*Total : ${fcfa(this.total())}*`,
      '',
      `Nom : ${this.name() || '-'}`,
      `Téléphone : ${this.phone() || '-'}`,
      `Adresse : ${this.address() || '-'}`,
    ].join('\n');
    return whatsappLink(msg);
  });
}
