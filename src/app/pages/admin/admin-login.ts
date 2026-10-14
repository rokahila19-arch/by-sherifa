import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import * as icons from '../../icons';
import { AdminService } from '../../services/admin.service';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-admin-login',
  imports: [FormsModule, RouterLink, FaIconComponent],
  template: `
    <div class="container page">
      <form class="admin-card login" (ngSubmit)="submit()">
        <div class="lock"><fa-icon [icon]="i.faLock" /></div>
        <h1>Espace gérante</h1>
        <p class="muted">Connectez-vous pour ajouter et modifier les articles de la boutique.</p>

        @if (!configured) {
          <p class="admin-error">Supabase n'est pas encore configuré sur ce site.</p>
        }

        <label class="field">E-mail
          <input type="email" name="email" [(ngModel)]="email" autocomplete="username" required />
        </label>
        <label class="field">Mot de passe
          <input type="password" name="password" [(ngModel)]="password" autocomplete="current-password" required />
        </label>
        @if (error()) { <p class="admin-error">{{ error() }}</p> }
        <button class="btn btn-dark btn-block" type="submit" [disabled]="busy() || !configured">
          {{ busy() ? 'Connexion…' : 'Se connecter' }}
        </button>
        <a routerLink="/" class="back"><fa-icon [icon]="i.faChevronLeft" /> Retour à la boutique</a>
      </form>
    </div>
  `,
  styles: `
    .login { max-width: 400px; margin: 32px auto; text-align: center; }
    .lock { width: 56px; height: 56px; margin: 0 auto 8px; border-radius: 50%; background: var(--ink); color: #fff; display: grid; place-items: center; font-size: 22px; }
    h1 { margin: 0 0 4px; font-size: 22px; }
    .field { text-align: left; }
    .back { display: inline-block; margin-top: 16px; color: var(--muted); font-size: 13px; }
  `,
})
export class AdminLogin {
  private readonly admin = inject(AdminService);
  private readonly router = inject(Router);
  protected readonly i = icons;
  protected readonly configured = inject(SupabaseService).enabled;

  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly busy = signal(false);
  protected readonly error = signal('');

  constructor() {
    // Déjà connectée : direction la liste des articles.
    this.admin.isAdmin().then((ok) => ok && this.router.navigate(['/admin']));
  }

  protected async submit(): Promise<void> {
    this.busy.set(true);
    this.error.set('');
    try {
      await this.admin.signIn(this.email().trim(), this.password());
      this.router.navigate(['/admin']);
    } catch (e) {
      this.error.set((e as Error).message);
    } finally {
      this.busy.set(false);
    }
  }
}
