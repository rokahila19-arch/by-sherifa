import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../services/cart.service';
import { CatalogService } from '../services/catalog.service';
import { FavoritesService } from '../services/favorites.service';
import { SHOP } from '../services/shop-info';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import * as icons from '../icons';


@Component({
  selector: 'app-header',
  imports: [FormsModule, RouterLink, RouterLinkActive, FaIconComponent],
  template: `
    <div class="topbar">
      <div class="container topbar-inner">
        <span><fa-icon [icon]="i.faTruckFast" /> Import direct Chine <fa-icon [icon]="i.faArrowRight" /> Burkina Faso</span>
        <span class="phones">
          <a href="https://wa.me/{{ shop.whatsappBF }}" target="_blank" rel="noopener"><fa-icon [icon]="i.faWhatsapp" /> BF {{ shop.phoneBF }}</a>
          <a href="tel:{{ shop.phoneCN.replaceAll(' ', '') }}"><fa-icon [icon]="i.faWhatsapp" /> CN {{ shop.phoneCN }}</a>
        </span>
      </div>
    </div>
    <header>
      <div class="container bar">
        <a routerLink="/" class="logo" aria-label="Accueil Stock Chine by Cherifa">
          <span class="logo-main">STOCK CHINE</span>
          <span class="logo-sub">by Cherifa</span>
        </a>
        <form class="search" (ngSubmit)="search()" role="search">
          <input
            type="search"
            name="q"
            [(ngModel)]="query"
            placeholder="Hoodie oversize, cargo, jean baggy…"
            aria-label="Rechercher un article"
          />
          <button type="submit" aria-label="Rechercher"><fa-icon [icon]="i.faMagnifyingGlass" /></button>
        </form>
        <nav class="icons">
          <a routerLink="/favoris" aria-label="Favoris" class="icon">
            <fa-icon [icon]="i.faHeartOutline" /> @if (favs.count()) { <span class="dot">{{ favs.count() }}</span> }
          </a>
          <a routerLink="/panier" aria-label="Panier" class="icon">
            <fa-icon [icon]="i.faCartShopping" /> @if (cart.count()) { <span class="dot">{{ cart.count() }}</span> }
          </a>
          <a routerLink="/compte" aria-label="Mon compte" class="icon desktop"><fa-icon [icon]="i.faUser" /></a>
        </nav>
      </div>
      <nav class="cats" aria-label="Catégories">
        <div class="container cats-inner">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Tout</a>
          <a routerLink="/produits" [queryParams]="{ flash: 1 }" class="flash"><fa-icon [icon]="i.faBolt" /> Flash</a>
          @for (c of catalog.categories; track c.slug) {
            <a [routerLink]="['/categorie', c.slug]" routerLinkActive="active">{{ c.name }}</a>
          }
        </div>
      </nav>
    </header>
  `,
  styles: `
    :host { position: sticky; top: 0; z-index: 50; display: block; }
    .topbar { background: var(--ink); color: #fff; font-size: 12px; }
    .topbar-inner { display: flex; justify-content: space-between; gap: 12px; height: 28px; align-items: center; overflow: hidden; white-space: nowrap; }
    .phones { display: flex; gap: 14px; }
    @media (max-width: 640px) { .topbar-inner > span:first-child { display: none; } .topbar-inner { justify-content: center; } }
    header { background: #fff; border-bottom: 1px solid var(--line); }
    .bar { display: flex; align-items: center; gap: 16px; height: 60px; }
    .logo { display: flex; flex-direction: column; line-height: 1; flex-shrink: 0; }
    .logo-main { font-weight: 900; font-size: 20px; letter-spacing: 1px; color: var(--brand); }
    .logo-sub { font-family: Georgia, serif; font-style: italic; font-size: 12px; color: var(--ink); align-self: flex-end; }
    .search { flex: 1; display: flex; height: 40px; border: 2px solid var(--ink); border-radius: 999px; overflow: hidden; background: #fff; }
    .search input { flex: 1; min-width: 0; border: 0; outline: none; padding: 0 14px; }
    .search button { width: 48px; background: var(--ink); color: #fff; }
    .icons { display: flex; gap: 6px; }
    .icon { position: relative; font-size: 20px; width: 40px; height: 40px; display: grid; place-items: center; }
    .dot { position: absolute; top: 2px; right: 0; min-width: 18px; height: 18px; padding: 0 4px; border-radius: 9px; background: var(--brand); color: #fff; font-size: 11px; font-weight: 700; display: grid; place-items: center; }
    @media (max-width: 640px) {
      .bar { flex-wrap: wrap; height: auto; padding-top: 8px; padding-bottom: 8px; gap: 8px 12px; }
      .logo { flex: 1; }
      .search { order: 3; flex-basis: 100%; height: 38px; }
      .desktop { display: none; }
    }
    .cats { border-top: 1px solid var(--line); }
    .cats-inner { display: flex; gap: 20px; overflow-x: auto; scrollbar-width: none; height: 40px; align-items: center; white-space: nowrap; font-size: 13px; }
    .cats-inner::-webkit-scrollbar { display: none; }
    .cats a { padding: 10px 0; border-bottom: 2px solid transparent; color: var(--ink-2); }
    .cats a.flash { color: var(--brand); font-weight: 700; }
    .cats a.active { border-color: var(--ink); color: var(--ink); font-weight: 700; }
  `,
})
export class Header {
  protected readonly shop = SHOP;
  protected readonly i = icons;
  protected readonly cart = inject(CartService);
  protected readonly favs = inject(FavoritesService);
  protected readonly catalog = inject(CatalogService);
  private readonly router = inject(Router);
  protected readonly query = signal('');

  protected search(): void {
    const q = this.query().trim();
    this.router.navigate(['/produits'], { queryParams: q ? { q } : {} });
  }
}
