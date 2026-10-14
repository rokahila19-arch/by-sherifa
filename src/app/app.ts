import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BottomNav } from './components/bottom-nav';
import { Footer } from './components/footer';
import { Header } from './components/header';
import { ToastService } from './services/toast.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, BottomNav, Footer],
  template: `
    <app-header />
    <main><router-outlet /></main>
    <app-footer />
    <app-bottom-nav />
    @if (toast.message(); as msg) {
      <div class="toast" role="status">{{ msg }}</div>
    }
  `,
  styles: `
    .toast { position: fixed; left: 50%; top: 45%; translate: -50% -50%; z-index: 100; background: rgba(0,0,0,.82); color: #fff; padding: 12px 20px; border-radius: 10px; font-weight: 600; animation: pop .2s ease; }
    @keyframes pop { from { opacity: 0; scale: .9; } }
  `,
})
export class App {
  protected readonly toast = inject(ToastService);
}
