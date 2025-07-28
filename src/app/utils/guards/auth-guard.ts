import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChildFn, Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('rol');

  if (!token) {
    // No hay token, redirigir a login
    router.navigate(['/login']);
    return false;
  }

  // Roles permitidos para esta ruta, vienen de la configuración de la ruta
  const allowedRoles: string[] = route.data['roles'];

  if (allowedRoles && allowedRoles.length > 0) {
    if (!userRole || !allowedRoles.includes(userRole)) {
      // El rol del usuario no está autorizado para esta ruta
      // Puedes redirigir a página de acceso denegado o home
      router.navigate(['/login']);
      return false;
    }
  }

  // Todo ok, puede acceder
  return true;
};