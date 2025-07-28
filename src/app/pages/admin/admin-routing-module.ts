import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayout } from '../../components/main-layout/main-layout';
import { AdminDashboard } from './dashboard/dashboard'; // Asegúrate que 'AdminDashboard' esté exportado en dashboard/dashboard

const routes: Routes = [
  {
    path: '',
   // component: MainLayout,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboard } // Usa el dashboard de admin
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
