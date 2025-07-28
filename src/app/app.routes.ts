import { Routes } from '@angular/router';
import { Login } from './pages/usuario/login/login';
import { Register } from './pages/usuario/register/register';
import { authGuard } from './utils/guards/auth-guard';

export const routes: Routes = [
  // Rutas públicas
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },

  //Rutas privadas
  //ADMIN
  {
    path: 'admin',
    canActivate: [authGuard],
    data: { roles: ['admin'] },
    loadChildren: () =>
      import('./pages/admin/admin-module').then((m) => m.AdminModule),
  },
  //ESTUDIANTE
  {
    path: 'estudiante',
    canActivate: [authGuard],
    data: { roles: ['estudiante'] },
    loadChildren: () =>
      import('./pages/estudiante/estudiante-module').then((m) => m.EstudianteModule),
  },
  //Rutas Incorrectas
  { path: '**', redirectTo: 'login' }
];
