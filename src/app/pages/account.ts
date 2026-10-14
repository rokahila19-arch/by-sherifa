import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductCard } from '../components/product-card';
import { CartService } from '../services/cart.service';
import { CatalogService } from '../services/catalog.service';
import { FavoritesService } from '../services/favorites.service';
import { HistoryService } from '../services/history.service';
import { SHOP, whatsappLink } from '../services/shop-info';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import * as icons from '../icons';


@Component({
  selector: 'app-account',
  imports: [RouterLink, ProductCard, FaIconComponent],
  template: `
    <div class="container page">
      <section class="hero">
        <div class="avatar"><fa-icon [icon]="i.faUser" /></div>
        <div>
          <h1>Bienvenue chez Stock Chine</h1>
          <p>by Cherifa — achat & vente en ligne</p>
        </div>
      </section>

      <div class="stats">
        <a routerLink="/panier"><b>{{ cart.count() }}</b>Panier</a>
        <a routerLink="/favoris"><b>{{ favs.count() }}</b>Favoris</a>
        <a routerLink="/produits"><b>{{ total }}</b>Articles</a>
      </div>

      <section class="section">
        <div class="section-head"><h2>Nous contacter</h2></div>
        <div class="contacts">
          <a class="contact" [href]="waBF" target="_blank" rel="noopener">
            <span class="flag">BF</span>
            <div><b>Burkina Faso</b><span>{{ shop.phoneBF }}</span></div>
            <span class="btn btn-wa"><fa-icon [icon]="i.faWhatsapp" /> WhatsApp</span>
          </a>
          <a class="contact" [href]="waCN" target="_blank" rel="noopener">
            <span class="flag">CN</span>
            <div><b>Chine (sourcing)</b><span>{{ shop.phoneCN }}</span></div>
            <span class="btn btn-wa"><fa-icon [icon]="i.faWhatsapp" /> WhatsApp</span>
          </a>
        </div>
      </section>

      <section class="section">
        <div class="section-head"><h2>Comment commander ?</h2></div>
        <ol class="steps">
          <li><b>Choisissez</b> vos articles et ajoutez-les au panier.</li>
          <li><b>Envoyez</b> votre commande via WhatsApp en un clic.</li>
          <li><b>Payez</b> par Orange Money, Moov Money ou à la livraison.</li>
          <li><b>Recevez</b> votre colis à Ouaga en 24–48h.</li>
        </ol>
        <p class="note">Vous cherchez un article qui n'est pas en ligne ? Envoyez-nous une photo sur WhatsApp, nous le trouvons pour vous en Chine.</p>
      </section>

      @if (history.products().length) {
        <section class="section">
          <div class="section-head"><h2>Vus récemment</h2></div>
          <div class="h-scroll">
            @for (p of history.products(); track p.id) { <app-product-card [product]="p" /> }
          </div>
        </section>
      }
    </div>
  `,
  styles: `
    .hero { display: flex; align-items: center; gap: 14px; margin-top: 12px; padding: 20px 16px; border-radius: var(--radius); background: linear-gradient(120deg, #161616, #4a1c1c); color: #fff; }
    .avatar { width: 56px; height: 56px; border-radius: 50%; background: #fff; display: grid; place-items: center; font-size: 24px; color: var(--ink); }
    h1 { margin: 0; font-size: 18px; }
    .hero p { margin: 2px 0 0; color: var(--gold); font-style: italic; }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); background: #fff; border-radius: var(--radius); margin-top: 12px; }
    .stats a { display: flex; flex-direction: column; align-items: center; padding: 14px 0; font-size: 12px; color: var(--ink-2); }
    .stats b { font-size: 20px; color: var(--ink); }
    .contacts { display: grid; gap: 10px; }
    @media (min-width: 700px) { .contacts { grid-template-columns: 1fr 1fr; } }
    .contact { display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid var(--line); border-radius: 10px; }
    .contact div { flex: 1; display: flex; flex-direction: column; }
    .contact div span { color: var(--ink-2); }
    .flag { width: 40px; height: 40px; border-radius: 50%; background: var(--ink); color: #fff; display: grid; place-items: center; font-weight: 800; font-size: 13px; }
    .contact .btn { height: 36px; font-size: 13px; padding: 0 14px; }
    .steps { margin: 0; padding-left: 20px; display: grid; gap: 8px; color: var(--ink-2); }
    .note { background: #fff6ef; padding: 10px 12px; border-radius: 8px; font-size: 13px; margin: 14px 0 0; }
  `,
})
export class Account {
  protected readonly shop = SHOP;
  protected readonly i = icons;
  protected readonly cart = inject(CartService);
  protected readonly favs = inject(FavoritesService);
  protected readonly history = inject(HistoryService);
  protected readonly total = inject(CatalogService).products.length;
  protected readonly waBF = whatsappLink('Bonjour Stock Chine by Cherifa !');
  protected readonly waCN = whatsappLink('Bonjour, j\'aimerais faire un sourcing en Chine.', SHOP.whatsappCN);
}
