import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductCard } from '../components/product-card';
import { CatalogService } from '../services/catalog.service';
import { HistoryService } from '../services/history.service';
import { whatsappLink } from '../services/shop-info';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import * as icons from '../icons';


interface Slide {
  title: string;
  subtitle: string;
  cta: string;
  link: string[];
  query?: Record<string, string | number>;
  image: string;
  bg: string;
}

const PAGE_SIZE = 20;

@Component({
  selector: 'app-home',
  imports: [RouterLink, ProductCard, FaIconComponent],
  template: `
    <div class="container page">
      <!-- Bannière -->
      <section class="hero" aria-roledescription="carrousel">
        @for (s of slides; track s.title; let n = $index) {
          <a class="slide" [class.on]="n === slide()" [style.background]="s.bg" [routerLink]="s.link" [queryParams]="s.query">
            <div class="txt">
              <span class="kicker">STOCK CHINE by Cherifa</span>
              <h1>{{ s.title }}</h1>
              <p>{{ s.subtitle }}</p>
              <span class="btn btn-dark">{{ s.cta }} <fa-icon [icon]="i.faArrowRight" /></span>
            </div>
            <img [src]="s.image" [alt]="s.title" />
          </a>
        }
        <div class="dots">
          @for (s of slides; track s.title; let n = $index) {
            <button type="button" [class.on]="n === slide()" (click)="slide.set(n)" [attr.aria-label]="'Diapositive ' + (n + 1)"></button>
          }
        </div>
      </section>

      <!-- Avantages -->
      <div class="perks">
        <span><fa-icon [icon]="i.faTruckFast" /> Livraison Ouaga & Bobo</span>
        <span><fa-icon [icon]="i.faBoxesStacked" /> Prix de gros dès 10 pcs</span>
        <span><fa-icon [icon]="i.faMoneyBillWave" /> Paiement Orange Money</span>
        <span><fa-icon [icon]="i.faCircleCheck" /> Qualité vérifiée</span>
      </div>

      <!-- Catégories -->
      <section class="section">
        <div class="section-head"><h2>Catégories</h2><a routerLink="/categories">Tout voir ›</a></div>
        <div class="cat-grid">
          @for (c of catalog.categories; track c.slug) {
            <a [routerLink]="['/categorie', c.slug]" class="cat">
              <img [src]="c.image" [alt]="c.name" loading="lazy" />
              <span>{{ c.name }}</span>
            </a>
          }
        </div>
      </section>

      <!-- Ventes flash -->
      <section class="section flash">
        <div class="section-head">
          <h2><fa-icon class="hot" [icon]="i.faBolt" /> Ventes Flash
            <span class="timer">Fin dans <b>{{ countdown().h }}</b>:<b>{{ countdown().m }}</b>:<b>{{ countdown().s }}</b></span>
          </h2>
          <a routerLink="/produits" [queryParams]="{ flash: 1 }">Voir tout ›</a>
        </div>
        <div class="h-scroll">
          @for (p of flash(); track p.id) { <app-product-card [product]="p" /> }
        </div>
      </section>

      <!-- Grossiste -->
      <a class="wholesale" [href]="waWholesale" target="_blank" rel="noopener">
        <div>
          <b>Vous êtes revendeur ?</b>
          <span>Commandez en gros directement depuis la Chine — tarifs dégressifs et sourcing sur demande.</span>
        </div>
        <span class="btn btn-wa"><fa-icon [icon]="i.faWhatsapp" /> WhatsApp</span>
      </a>

      <!-- Meilleures ventes -->
      <section class="section">
        <div class="section-head"><h2><fa-icon class="hot" [icon]="i.faFire" /> Meilleures ventes</h2><a routerLink="/produits" [queryParams]="{ tri: 'ventes' }">Voir tout ›</a></div>
        <div class="h-scroll">
          @for (p of best(); track p.id) { <app-product-card [product]="p" /> }
        </div>
      </section>

      <!-- Nouveautés -->
      <section class="section">
        <div class="section-head"><h2><fa-icon class="hot" [icon]="i.faWandMagicSparkles" /> Nouveautés</h2><a routerLink="/produits" [queryParams]="{ tri: 'nouveautes' }">Voir tout ›</a></div>
        <div class="h-scroll">
          @for (p of fresh(); track p.id) { <app-product-card [product]="p" /> }
        </div>
      </section>

      @if (history.products().length) {
        <section class="section">
          <div class="section-head"><h2><fa-icon class="hot" [icon]="i.faEye" /> Vus récemment</h2></div>
          <div class="h-scroll">
            @for (p of history.products(); track p.id) { <app-product-card [product]="p" /> }
          </div>
        </section>
      }

      <!-- Pour vous -->
      <div class="section-head foryou"><h2>Pour vous</h2></div>
      <div class="product-grid">
        @for (p of forYou(); track p.id) { <app-product-card [product]="p" /> }
      </div>
      @if (forYou().length < feed().length) {
        <div class="more"><button class="btn btn-outline" type="button" (click)="shown.update(n => n + 20)">Voir plus d'articles</button></div>
      }
    </div>
  `,
  styles: `
    .hero { position: relative; margin-top: 12px; border-radius: 14px; overflow: hidden; height: 230px; }
    @media (min-width: 900px) { .hero { height: 340px; } }
    .slide { position: absolute; inset: 0; display: flex; align-items: center; justify-content: space-between; padding: 0 6%; opacity: 0; transition: opacity .6s; pointer-events: none; }
    .slide.on { opacity: 1; pointer-events: auto; }
    .txt { max-width: 55%; z-index: 1; }
    .kicker { font-size: 11px; letter-spacing: 2px; font-weight: 700; color: var(--brand); }
    h1 { margin: 6px 0; font-size: clamp(20px, 4vw, 40px); line-height: 1.1; font-weight: 900; }
    .txt p { margin: 0 0 14px; color: var(--ink-2); }
    .txt .btn { height: 38px; font-size: 13px; }
    .slide img { position: absolute; right: 0; top: 0; height: 100%; width: 50%; object-fit: cover; -webkit-mask-image: linear-gradient(90deg, transparent, #000 35%); mask-image: linear-gradient(90deg, transparent, #000 35%); }
    .dots { position: absolute; bottom: 10px; left: 0; right: 0; display: flex; justify-content: center; gap: 6px; }
    .dots button { width: 8px; height: 8px; border-radius: 4px; background: rgba(0,0,0,.25); transition: width .3s; }
    .dots button.on { width: 22px; background: var(--ink); }
    .perks { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; margin-top: 12px; }
    .perks fa-icon, .hot { color: var(--brand); }
    .perks span { flex: 1 0 auto; background: #fff; border-radius: 8px; padding: 8px 12px; font-size: 12px; font-weight: 600; text-align: center; }
    .cat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px 8px; }
    @media (min-width: 900px) { .cat-grid { grid-template-columns: repeat(12, 1fr); } }
    .cat { display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center; font-size: 11px; }
    .cat img { width: 100%; max-width: 76px; aspect-ratio: 1; border-radius: 50%; object-fit: cover; background: #f2f2f2; border: 1px solid var(--line); }
    .flash { background: linear-gradient(180deg, #fff1ec, #fff 120px); }
    .timer { font-size: 12px; font-weight: 500; margin-left: 8px; color: var(--ink-2); }
    .timer b { background: var(--ink); color: #fff; border-radius: 4px; padding: 1px 4px; }
    .wholesale { display: flex; align-items: center; justify-content: space-between; gap: 12px; background: linear-gradient(90deg, #161616, #3a1d1d); color: #fff; border-radius: var(--radius); padding: 16px; }
    .wholesale div { display: flex; flex-direction: column; gap: 4px; }
    .wholesale span:not(.btn) { color: #ddd; font-size: 13px; }
    .foryou { margin-top: 20px; justify-content: center; }
    .more { display: flex; justify-content: center; margin-top: 20px; }
  `,
})
export class Home {
  protected readonly catalog = inject(CatalogService);
  protected readonly i = icons;
  protected readonly history = inject(HistoryService);

  protected readonly flash = this.catalog.flashSales;
  protected readonly best = this.catalog.bestSellers;
  protected readonly fresh = this.catalog.newArrivals;
  protected readonly feed = computed(() =>
    [...this.catalog.products()].sort((a, b) => ((a.id * 7919) % 97) - ((b.id * 7919) % 97)),
  );
  protected readonly shown = signal(PAGE_SIZE);
  protected readonly forYou = computed(() => this.feed().slice(0, this.shown()));
  protected readonly waWholesale = whatsappLink('Bonjour, je suis revendeur et je souhaite commander en gros.');

  protected readonly slides: Slide[] = [
    { title: 'Hoodies & pulls oversize', subtitle: 'Le confort streetwear dès 7 500 FCFA', cta: 'Découvrir', link: ['/categorie', 'pulls-sweats'], image: 'https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?auto=format&fit=crop&w=900&q=70', bg: 'linear-gradient(120deg,#efe9e1,#e2d8cb)' },
    { title: 'Cargos & jeans baggy', subtitle: 'Les coupes larges qui font la tendance', cta: 'Shopper', link: ['/categorie', 'cargos'], image: 'https://images.unsplash.com/photo-1511794322962-129ddbd0af38?auto=format&fit=crop&w=900&q=70', bg: 'linear-gradient(120deg,#e9e4d8,#d6cfbf)' },
    { title: 'T-shirts neutres', subtitle: 'Blanc, noir, beige… les essentiels', cta: 'Voir', link: ['/categorie', 't-shirts'], image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=70', bg: 'linear-gradient(120deg,#f4f4f2,#e4e4e0)' },
    { title: 'Ventes flash', subtitle: 'Quantités limitées, prix imbattables', cta: "J'en profite", link: ['/produits'], query: { flash: 1 }, image: 'https://images.unsplash.com/photo-1597350584914-55bb62285896?auto=format&fit=crop&w=900&q=70', bg: 'linear-gradient(120deg,#ffe5e5,#ffd1d1)' },
  ];
  protected readonly slide = signal(0);

  private readonly flashEnd = (() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d.getTime();
  })();
  private readonly now = signal(Date.now());
  protected readonly countdown = computed(() => {
    const left = Math.max(0, this.flashEnd - this.now());
    const pad = (n: number) => String(Math.floor(n)).padStart(2, '0');
    return { h: pad(left / 3.6e6), m: pad((left / 6e4) % 60), s: pad((left / 1e3) % 60) };
  });

  constructor() {
    let ticks = 0;
    const id = setInterval(() => {
      this.now.set(Date.now());
      if (++ticks % 5 === 0) this.slide.update((i) => (i + 1) % this.slides.length);
    }, 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(id));
  }
}
