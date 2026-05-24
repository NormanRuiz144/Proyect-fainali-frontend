import { Routes } from '@angular/router';
import { Layout } from './pages/home/layout/layout';

export const routes: Routes = [
  // Portal Ciudadano
  {
    path: 'nuevo-reporte',
    loadComponent: () => import('./pages/usuario/nuevo-reporte/nuevo-reporte').then((c) => c.NuevoReporte),
  },
  // Bloque 1: experiencia publica
  {
    path: '',
    component: Layout,
    children: [
      {
        path: 'inicio',
        loadComponent: () => import('./pages/home/landing/landing-page').then((c) => c.LandingPage),
      },
    ],
  },
  // Area Administrativa
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/layout/layout-admin/layout-admin').then((c) => c.LayoutAdmin),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/admin/dashboard/dashboard').then((c) => c.Dashboard),
      },
      {
        path: 'reportes',
        loadComponent: () => import('./pages/admin/reportes/reportes').then((c) => c.Reportes),
      },
      {
        path: 'historial',
        loadComponent: () => import('./pages/admin/historial/historial').then((c) => c.Historial),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  //En caso de errores
  {
    path: '**',
    redirectTo: 'inicio',
  },
];
