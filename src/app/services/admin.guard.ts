import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminService } from './admin.service';

/** Réserve les pages /admin aux comptes listés dans la table `admins`. */
export const adminGuard: CanActivateFn = async () => {
  const router = inject(Router);
  return (await inject(AdminService).isAdmin()) ? true : router.parseUrl('/admin/connexion');
};
