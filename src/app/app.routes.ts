import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', title: 'Stock Chine by Cherifa — Boutique en ligne', loadComponent: () => import('./pages/home').then((m) => m.Home) },
  { path: 'produits', title: 'Tous les articles — Stock Chine', loadComponent: () => import('./pages/product-list').then((m) => m.ProductList) },
  { path: 'categorie/:slug', title: 'Catégorie — Stock Chine', loadComponent: () => import('./pages/product-list').then((m) => m.ProductList) },
  { path: 'produit/:id', title: 'Article — Stock Chine', loadComponent: () => import('./pages/product-detail').then((m) => m.ProductDetail) },
  { path: 'categories', title: 'Catégories — Stock Chine', loadComponent: () => import('./pages/categories').then((m) => m.Categories) },
  { path: 'panier', title: 'Mon panier — Stock Chine', loadComponent: () => import('./pages/cart').then((m) => m.Cart) },
  { path: 'favoris', title: 'Mes favoris — Stock Chine', loadComponent: () => import('./pages/favorites').then((m) => m.Favorites) },
  { path: 'compte', title: 'Mon compte — Stock Chine', loadComponent: () => import('./pages/account').then((m) => m.Account) },
  { path: '**', redirectTo: '' },
];
