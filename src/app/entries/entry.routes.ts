import { Routes } from '@angular/router';
import { EntryHomeComponent } from './entry-home/entry-home.component';
import { AccessFormComponent } from './accesses/features/access-form/access-form.component';
//import { AccessQueryComponent } from "./accesses/features/access-query/access-query.component";
import { AuthFormComponent } from './authorization/features/authorized-form/authorized-form.component';
//import { AuthorizedRangeFormComponent } from "./authorization/features/authorized-range-form/authorized-range-form.component";
import { AuthListComponent } from './authorization/features/list-auth/auth-list.component';
import { VisitorFormComponent } from './visitor/features/visitor-form/visitor-form.component';
import { QrComponent } from './qr/qr.component';
import { EntityFormComponent } from './entities/features/entity-form/entity-form/entity-form.component';
import { EntityListComponent } from './entities/features/entity-list/entity-list/entity-list.component';
import { GeneralDashboardsComponent } from './dashboard/general-dashboards/general-dashboards.component';
import { AccessListComponent } from './accesses/features/access-list/access-list/access-list.component';
import { authGuard } from '../users/guards/auth.guard';
import { hasRoleCodeGuard } from '../users/guards/has-role-code.guard';
import { URLTargetType } from '../users/models/role';

export const ENTRY_ROUTES: Routes = [
  {
    path: '',
    component: AuthFormComponent,
    canActivate: [authGuard],
    canMatch: [hasRoleCodeGuard],
    data: {
      allowedRoleCodes: [
        URLTargetType.SUPERADMIN,
        URLTargetType.SECURITY_GUARD,
        URLTargetType.OWNER,
      ],
    },
  },
  {
    path: 'register-range',
    component: AuthFormComponent,
    canActivate: [authGuard],
    canMatch: [hasRoleCodeGuard],
    data: {
      allowedRoleCodes: [
        URLTargetType.SUPERADMIN,
        URLTargetType.SECURITY_GUARD,
        URLTargetType.OWNER,
      ],
    },
  },
  {
    path: 'new/auth',
    component: AuthFormComponent,
    canActivate: [authGuard],
    canMatch: [hasRoleCodeGuard],
    data: {
      allowedRoleCodes: [
        URLTargetType.SUPERADMIN,
        URLTargetType.SECURITY_GUARD,
        URLTargetType.OWNER,
      ],
    },
  },
  {
    path: 'entity/form',
    component: EntityFormComponent,
    canActivate: [authGuard],
    canMatch: [hasRoleCodeGuard],
    data: {
      allowedRoleCodes: [
        URLTargetType.SUPERADMIN,
        URLTargetType.SECURITY_GUARD,
      ],
    },
  },
  {
    path: 'entity/edit/:id',
    component: EntityFormComponent,
    canActivate: [authGuard],
    canMatch: [hasRoleCodeGuard],
    data: {
      allowedRoleCodes: [
        URLTargetType.SUPERADMIN,
        URLTargetType.SECURITY_GUARD,
      ],
    },
  },
  {
    path: 'entity/list',
    component: EntityListComponent,
    canActivate: [authGuard],
    canMatch: [hasRoleCodeGuard],
    data: {
      allowedRoleCodes: [
        URLTargetType.SUPERADMIN,
        URLTargetType.SECURITY_GUARD,
      ],
    },
  },
  {
    path: 'qr',
    component: QrComponent,
    canActivate: [authGuard],
    canMatch: [hasRoleCodeGuard],
    data: {
      allowedRoleCodes: [
        URLTargetType.SUPERADMIN,
        URLTargetType.SECURITY_GUARD,
        URLTargetType.OWNER,
      ],
    },
  },
  {
    path: 'auth-list',
    component: AuthListComponent,
    canActivate: [authGuard],
    canMatch: [hasRoleCodeGuard],
    data: {
      allowedRoleCodes: [
        URLTargetType.SUPERADMIN,
        URLTargetType.SECURITY_GUARD,
        URLTargetType.OWNER,
      ],
    },
  },
  {
    path: 'access-form',
    component: AccessFormComponent,
    canActivate: [authGuard],
    canMatch: [hasRoleCodeGuard],
    data: {
      allowedRoleCodes: [
        URLTargetType.SUPERADMIN,
        URLTargetType.SECURITY_GUARD,
      ],
    },
  },
  {
    path: 'dashboard',
    component: GeneralDashboardsComponent,
    canActivate: [authGuard],
    canMatch: [hasRoleCodeGuard],
    data: {
      allowedRoleCodes: [
        URLTargetType.SUPERADMIN,
        URLTargetType.SECURITY_GUARD,
      ],
    },
  },
  {
    path: 'access-query',
    component: AccessListComponent,
    canActivate: [authGuard],
    canMatch: [hasRoleCodeGuard],
    data: {
      allowedRoleCodes: [
        URLTargetType.SUPERADMIN,
        URLTargetType.SECURITY_GUARD,
        URLTargetType.OWNER,
      ],
    },
  },
  {
    path: '',
    redirectTo: '/visitors',
    pathMatch: 'full',
  },
];
