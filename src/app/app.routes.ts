import { Routes } from '@angular/router';
import { Layout } from './pages/home/layout/layout';

export const routes: Routes = [
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
  //En caso de errores
  {
    path: '**',
    redirectTo: 'inicio',
  },
];
