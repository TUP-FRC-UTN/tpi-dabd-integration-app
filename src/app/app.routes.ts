import { Routes } from '@angular/router';
import { LoginComponent } from './users/components/login/login.component';
import { authGuard } from './users/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'entries',
    loadChildren: () =>
      import('./entries/entry.routes').then((m) => m.ENTRY_ROUTES),
    //canActivate: [authGuard],
  },
  {
    path: 'invoices',
    loadChildren: () =>
      import('./invoices/invoice.routes').then((m) => m.INVOICE_ROUTES),
    //canActivate: [authGuard],
  },
  {
    path: 'expenses',
    loadChildren: () =>
      import('./expenses/expenses.routes').then((m) => m.EXPENSES_ROUTES),
    //canActivate: [authGuard],
  },
  {
    path: 'inventories',
    loadChildren: () =>
      import('./inventories/inventory.routes').then((m) => m.INVENTORY_ROUTES),
    //canActivate: [authGuard],
  },
  {
    path: 'penalties',
    loadChildren: () =>
      import('./penalties/penalty.routes').then((m) => m.PENALTY_ROUTES),
    //canActivate: [authGuard],
  },
  {
    path: 'notifications',
    loadChildren: () =>
      import('./notifications/notification.routes').then(
        (m) => m.NOTIFICATION_ROUTES
      ),
    //canActivate: [authGuard],
  },
  {
    path: 'users',
    loadChildren: () =>
      import('./users/user.routes').then((m) => m.USER_ROUTES),
    //canActivate: [authGuard],
  },
];
