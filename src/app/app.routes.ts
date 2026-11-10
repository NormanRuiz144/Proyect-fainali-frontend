import { Routes } from '@angular/router';
import { Layout } from './pages/home/layout/layout';
import { AuthGuard } from './guards/AuthGuard';
import { PermissionGuard } from './guards/PermissionGuard';

export const routes: Routes = [
  // Bloque 1: experiencia publica
  {
    path: '',
    component: Layout,
    children: [
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full',
      },
      {
        path: 'inicio',
        loadComponent: () => import('./pages/home/landing/landing-page').then((c) => c.LandingPage),
      },
    ],
  },
  // Portal Ciudadano
  {
    path: 'reportes',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/usuario/nuevo-reporte/nuevo-reporte').then((c) => c.NuevoReporte),
  },
  {
    path: 'operadores',
    canActivate: [AuthGuard],
    data: { requiereOperador: true },
    loadComponent: () =>
      import('./pages/admin/layout/layout-admin/layout-admin').then((c) => c.LayoutAdmin),
    children: [
      {
        path: 'dashboard',
        canActivate: [PermissionGuard],
        data: { permisos: ['operadores.ver'] },
        loadComponent: () => import('./pages/admin/dashboard/dashboard').then((c) => c.Dashboard),
      },
      {
        path: 'incidencias',
        canActivate: [PermissionGuard],
        data: { permisos: ['incidencias.ver'] },
        loadComponent: () => import('./pages/admin/reportes/reportes').then((c) => c.Reportes),
      },
      {
        path: 'historial',
        canActivate: [PermissionGuard],
        data: { permisos: ['incidencias.ver'] },
        loadComponent: () => import('./pages/admin/historial/historial').then((c) => c.Historial),
      },
      {
        path: 'baneados',
        canActivate: [PermissionGuard],
        data: { permisos: ['banned_users.ver'] },
        loadComponent: () =>
          import('./features/ban/components/usuarios-baneados').then((c) => c.UsuariosBaneadosComponent),
      },
      {
        path: 'usuarios',
        canActivate: [PermissionGuard],
        data: { permisos: ['usuarios.ver'] },
        loadComponent: () => import('./features/usuario/components/usuarios').then((c) => c.UsuariosComponent),
      },
      {
        path: 'mapa',
        canActivate: [PermissionGuard],
        data: { permisos: ['incidencias.ver'] },
        loadComponent: () =>
          import('./pages/superAdmin/mapa-reportes/mapa-reportes').then((c) => c.MapaReportes),
      },
      {
        path: 'problematicas',
        canActivate: [PermissionGuard],
        data: { permisos: ['problematicas.ver'] },
        loadComponent: () =>
          import('./features/problematicas/components/problematicas').then(
            (c) => c.ProblematicasComponent,
          ),
      },
      {
        path: 'ubicaciones',
        canActivate: [PermissionGuard],
        data: { permisos: ['departamentos.ver', 'municipios.ver', 'sectores.ver'], requiereAlguno: true },
        loadComponent: () =>
          import('./features/ubicacion/components/ubicacion').then((c) => c.UbicacionComponent),
      },
      {
        path: 'accesos',
        canActivate: [PermissionGuard],
        data: { permisos: ['operadores.ver', 'operadores.crear', 'permisos.ver', 'permisos.administrar'], requiereAlguno: true },
        loadComponent: () => import('./pages/operadores/accesos/accesos').then((c) => c.AccesosComponent),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  { path: 'admin', pathMatch: 'full', redirectTo: 'operadores/dashboard' },
  { path: 'admin/:path', redirectTo: 'operadores/dashboard' },
  { path: 'superAdmin', pathMatch: 'full', redirectTo: 'operadores/dashboard' },
  { path: 'superAdmin/:path', redirectTo: 'operadores/dashboard' },
  //En caso de errores
  {
    path: '**',
    redirectTo: 'inicio',
  },
];
