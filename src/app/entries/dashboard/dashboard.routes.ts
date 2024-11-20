import { Routes } from '@angular/router';
import { GeneralDashboardsComponent } from './general-dashboards/general-dashboards.component';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: GeneralDashboardsComponent
  },
  {
    path: 'hourly',
    loadComponent: () => import('../accesses/features/access-hourly-dashboard/access-hourly-dashboard/access-hourly-dashboard.component')
      .then(m => m.AccessHourlyDashboardComponent)
  },
  {
    path: 'weekly',
    loadComponent: () => import('../accesses/features/access-weekly-dashboard/access-weekly-dashboard/access-weekly-dashboard.component')
      .then(m => m.AccessWeeklyDashboardComponent)
  },
  {
    path: 'weekly-pie',
    loadComponent: () => import('../accesses/features/access-pie-dashboard/access-pie-dashboard/access-pie-dashboard.component')
      .then(m => m.AccessPieDashboardComponent)
  }
];