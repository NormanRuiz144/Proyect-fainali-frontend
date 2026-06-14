import { Routes } from '@angular/router';
import { Layout } from './pages/home/layout/layout';
import { AuthGuard } from './guards/AuthGuard';

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
  // Portal Ciudadano
  {
    path: 'nuevo-reporte',
    loadComponent: () =>
      import('./pages/usuario/nuevo-reporte/nuevo-reporte').then((c) => c.NuevoReporte),
  },
  // Area Administrativa
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin/layout/layout-admin/layout-admin').then((c) => c.LayoutAdmin),
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
        pathMatch: 'full',
      },
    ],
  },
  // Area Super Admin
  {
    path: 'superAdmin',
    loadComponent: () =>
      import('./pages/superAdmin/layout/layout-super-admin').then((c) => c.LayoutSuperAdmin),
    // canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/admin/dashboard/dashboard').then((c) => c.Dashboard),
      },
      {
        path: 'problematicas',
        loadComponent: () =>
          import('./features/problematicas/components/problematicas').then(
            (c) => c.ProblematicasComponent,
          ),
      },
      {
        path: 'ubicaciones',
        loadComponent: () =>
          import('./features/ubicacion/components/ubicacion').then((c) => c.UbicacionComponent),
      },
      {
        path: 'instituciones',
        loadComponent: () =>
          import('./features/instituciones/components/instituciones').then(
            (c) => c.InstitucionesComponent,
          ),
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./features/usuario/components/usuarios').then((c) => c.UsuariosComponent),
      },
      {
        path: '',
        redirectTo: 'problematicas',
        pathMatch: 'full',
      },
    ],
  },
  //En caso de errores
  {
    path: '**',
    redirectTo: 'inicio',
  },
];
