import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../services/catalog.service';
import { SHOP, whatsappLink } from '../services/shop-info';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import * as icons from '../icons';


@Component({
  selector: 'app-footer',
  imports: [RouterLink, FaIconComponent],
  template: `
    <footer>
      <div class="container grid">
        <div>
          <div class="logo">STOCK CHINE <i>by Cherifa</i></div>
          <p>Votre boutique de mode en ligne : hoodies oversize, cargos, jeans, t-shirts neutres, robes et accessoires importés directement de Chine. Prix détail et prix de gros.</p>
        </div>
        <div>
          <h4>Catégories</h4>
          @for (c of catalog.categories.slice(0, 6); track c.slug) {
            <a [routerLink]="['/categorie', c.slug]">{{ c.name }}</a>
          }
        </div>
        <div>
          <h4>Service client</h4>
          <a routerLink="/compte">Mon compte</a>
          <a routerLink="/panier">Mon panier</a>
          <a routerLink="/favoris">Mes favoris</a>
          <a [href]="wa" target="_blank" rel="noopener"><fa-icon [icon]="i.faWhatsapp" /> Commander sur WhatsApp</a>
        </div>
        <div>
          <h4>Contact</h4>
          <a href="tel:+22602739392"><fa-icon [icon]="i.faPhone" /> Burkina : {{ shop.phoneBF }}</a>
          <a href="tel:+8618339267415"><fa-icon [icon]="i.faPhone" /> Chine : {{ shop.phoneCN }}</a>
          <p class="pay"><fa-icon [icon]="i.faMoneyBillWave" /> Paiement : Orange Money · Moov Money · Espèces à la livraison</p>
        </div>
      </div>
      <div class="copy">© {{ year }} Stock Chine by Cherifa — Tous droits réservés</div>
    </footer>
  `,
  styles: `
    footer { background: var(--ink); color: #cfcfcf; margin-top: 24px; padding: 32px 0 calc(var(--bottom-nav-h) + 16px); font-size: 13px; }
    @media (min-width: 900px) { footer { padding-bottom: 16px; } }
    .grid { display: grid; gap: 24px; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
    .logo { color: #fff; font-weight: 900; font-size: 18px; letter-spacing: 1px; }
    .logo i { font-family: Georgia, serif; font-weight: 400; font-size: 13px; color: var(--gold); }
    h4 { color: #fff; margin: 0 0 10px; }
    a { display: block; padding: 3px 0; }
    a:hover { color: #fff; }
    .pay { color: #9a9a9a; }
    .copy { text-align: center; border-top: 1px solid #2c2c2c; margin-top: 24px; padding-top: 16px; color: #8a8a8a; }
  `,
})
export class Footer {
  protected readonly shop = SHOP;
  protected readonly i = icons;
  protected readonly catalog = inject(CatalogService);
  protected readonly wa = whatsappLink('Bonjour Stock Chine by Cherifa, je souhaite passer une commande.');
  protected readonly year = new Date().getFullYear();
}
