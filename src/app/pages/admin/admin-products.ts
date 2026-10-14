import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import * as icons from '../../icons';
import { AdminProduct, AdminService } from '../../services/admin.service';
import { CatalogService } from '../../services/catalog.service';
import { FcfaPipe } from '../../services/fcfa.pipe';
import { ToastService } from '../../services/toast.service';

const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

@Component({
  selector: 'app-admin-products',
  imports: [FormsModule, RouterLink, FaIconComponent, FcfaPipe],
  template: `
    <div class="container page">
      <div class="admin-head">
        <div>
          <h1>Mes articles</h1>
          <p class="muted">{{ products().length }} articles · {{ hiddenCount() }} masqués</p>
        </div>
        <button type="button" class="btn btn-outline small" (click)="logout()"><fa-icon [icon]="i.faRightFromBracket" /> Déconnexion</button>
      </div>

      <a routerLink="/admin/article/nouveau" class="btn btn-brand btn-block add"><fa-icon [icon]="i.faPlus" /> Ajouter un article</a>

      <div class="tools">
        <input type="search" [(ngModel)]="search" placeholder="Rechercher un article…" aria-label="Rechercher" />
        <select [(ngModel)]="category" aria-label="Catégorie">
          <option value="">Toutes les catégories</option>
          @for (c of catalog.categories; track c.slug) { <option [value]="c.slug">{{ c.name }}</option> }
        </select>
      </div>

      @if (loading()) {
        <p class="muted center">Chargement…</p>
      } @else if (error()) {
        <p class="admin-error">{{ error() }}</p>
      } @else {
        @for (p of filtered(); track p.id) {
          <article class="row" [class.off]="!p.active">
            <img [src]="p.images[0]" alt="" loading="lazy" />
            <div class="body">
              <a [routerLink]="['/admin/article', p.id]" class="title">{{ p.title }}</a>
              <span class="meta">{{ catalog.getCategory(p.category)?.name }} · stock {{ p.stock }}</span>
              <span class="price">{{ p.price | fcfa }}</span>
              <div class="tags">
                @if (!p.active) { <span class="badge badge-new">Masqué</span> }
                @if (p.flash) { <span class="badge">Flash</span> }
                @if (p.isNew) { <span class="badge badge-gold">Nouveau</span> }
              </div>
            </div>
            <div class="actions">
              <a [routerLink]="['/admin/article', p.id]" class="icon-btn" aria-label="Modifier"><fa-icon [icon]="i.faPen" /></a>
              <button type="button" class="icon-btn" (click)="toggle(p)" [attr.aria-label]="p.active ? 'Masquer' : 'Remettre en ligne'">
                <fa-icon [icon]="p.active ? i.faEye : i.faEyeSlash" />
              </button>
              <button type="button" class="icon-btn danger" (click)="remove(p)" aria-label="Supprimer"><fa-icon [icon]="i.faTrashCan" /></button>
            </div>
          </article>
        } @empty {
          <p class="muted center">Aucun article.</p>
        }
      }
    </div>
  `,
  styles: `
    .add { margin: 12px 0; }
    .small { height: 36px; font-size: 13px; padding: 0 14px; }
    .tools { display: grid; grid-template-columns: 1fr; gap: 8px; margin-bottom: 12px; }
    @media (min-width: 700px) { .tools { grid-template-columns: 1fr 260px; } }
    .tools input, .tools select { height: 42px; border: 1px solid var(--line); border-radius: 8px; padding: 0 12px; background: #fff; }
    .row { display: flex; gap: 10px; align-items: center; background: #fff; border-radius: var(--radius); padding: 8px; margin-bottom: 8px; }
    .row.off { opacity: .55; }
    .row img { width: 64px; height: 84px; object-fit: cover; border-radius: 6px; background: #f2f2f2; flex-shrink: 0; }
    .body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
    .title { font-weight: 600; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .meta { font-size: 11px; color: var(--muted); }
    .tags { display: flex; gap: 4px; }
    .actions { display: flex; flex-direction: column; gap: 4px; }
    @media (min-width: 600px) { .actions { flex-direction: row; } }
    .icon-btn { width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--line); display: grid; place-items: center; background: #fff; }
    .danger { color: var(--brand); }
    .center { text-align: center; padding: 32px 0; }
  `,
})
export class AdminProducts {
  private readonly admin = inject(AdminService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  protected readonly catalog = inject(CatalogService);
  protected readonly i = icons;

  protected readonly products = signal<AdminProduct[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly search = signal('');
  protected readonly category = signal('');

  protected readonly hiddenCount = computed(() => this.products().filter((p) => !p.active).length);
  protected readonly filtered = computed(() => {
    const q = normalize(this.search().trim());
    return this.products().filter(
      (p) => (!this.category() || p.category === this.category()) && (!q || normalize(p.title).includes(q)),
    );
  });

  constructor() {
    this.load();
  }

  private async load(): Promise<void> {
    try {
      this.products.set(await this.admin.list());
    } catch (e) {
      this.error.set('Impossible de charger les articles : ' + (e as Error).message);
    } finally {
      this.loading.set(false);
    }
  }

  protected async toggle(p: AdminProduct): Promise<void> {
    try {
      await this.admin.setActive(p.id, !p.active);
      this.products.update((list) => list.map((x) => (x.id === p.id ? { ...x, active: !p.active } : x)));
      this.toast.show(p.active ? 'Article masqué' : 'Article remis en ligne');
    } catch (e) {
      this.toast.show('Erreur : ' + (e as Error).message);
    }
  }

  protected async remove(p: AdminProduct): Promise<void> {
    if (!confirm(`Supprimer définitivement « ${p.title} » ?`)) return;
    try {
      await this.admin.remove(p);
      this.products.update((list) => list.filter((x) => x.id !== p.id));
      this.toast.show('Article supprimé');
    } catch (e) {
      this.toast.show('Erreur : ' + (e as Error).message);
    }
  }

  protected async logout(): Promise<void> {
    await this.admin.signOut();
    this.router.navigate(['/']);
  }
}
