import { Routes } from '@angular/router';
import { GeneralDashboardsComponent } from './general-dashboards/general-dashboards.component';

/**
 * Definición de rutas para el módulo de dashboard con implementación de lazy loading.
 * Estas rutas serán cargadas cuando se acceda al path 'dashboard' definido en el routing principal.
 */
export const DASHBOARD_ROUTES: Routes = [
  /**
   * Ruta raíz del dashboard.
   * @path ''
   * @component GeneralDashboardsComponent
   * Se carga cuando se accede a la ruta base '/dashboard'
   */
  {
    path: '',
    component: GeneralDashboardsComponent
  },
  /**
   * Ruta para el dashboard de análisis horario.
   * @path 'hourly'
   * @implements Lazy loading para optimizar el rendimiento
   * La ruta completa será '/dashboard/hourly'
   */
  {
    path: 'hourly',
    loadComponent: () => import('../../components/accesses/access-hourly-dashboard/access-hourly-dashboard.component')
      .then(m => m.AccessHourlyDashboardComponent)
  },
  /**
   * Ruta para el dashboard de análisis semanal.
   * @path 'weekly'
   * @implements Lazy loading para optimizar el rendimiento
   * La ruta completa será '/dashboard/weekly'
   */
  {
    path: 'weekly',
    loadComponent: () => import('../../components/accesses/access-weekly-dashboard/access-weekly-dashboard.component')
      .then(m => m.AccessWeeklyDashboardComponent)
  },
  /**
   * Ruta para el dashboard de gráfico circular semanal.
   * @path 'weekly-pie'
   * @implements Lazy loading para optimizar el rendimiento
   * La ruta completa será '/dashboard/weekly-pie'
   */
  {
    path: 'weekly-pie',
    loadComponent: () => import('../../components/accesses/access-pie-dashboard/access-pie-dashboard.component')
      .then(m => m.AccessPieDashboardComponent)
  }
];