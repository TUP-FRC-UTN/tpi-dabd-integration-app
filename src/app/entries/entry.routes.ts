import { Routes } from "@angular/router";
import { EntryHomeComponent } from "./entry-home/entry-home.component";
import { AccessFormComponent } from "./accesses/features/access-form/access-form.component";
import { AccessQueryComponent } from "./accesses/features/access-query/access-query.component";
import { AuthorizedFormComponent } from "./authorization/features/authorized-form/authorized-form.component";
import { AuthorizedRangeFormComponent } from "./authorization/features/authorized-range-form/authorized-range-form.component";
import { ListAuthComponent } from "./authorization/features/list-auth/list-auth.component";

import { VisitorFormComponent } from "./visitor/features/visitor-form/visitor-form.component";
import { VisitorListComponent } from "./visitor/features/visitor-list/visitor-list.component";
import { QrComponent } from "./qr/qr.component";
import { EntityFormComponent } from "./entities/features/entity-form/entity-form/entity-form.component";
import { EntityListComponent } from "./entities/features/entity-list/entity-list/entity-list.component";

export const ENTRY_ROUTES: Routes = [
    { path: '', component: EntryHomeComponent },
    {
      path: 'entity/form',
      component: EntityFormComponent,
    },
    {
      path: 'entity/edit/:id',
      component: EntityFormComponent,
    },
    {
      path: 'entity/list',
      component: EntityListComponent,
    },
      {
        path: 'qr',
        component: QrComponent,
      },
      {
        path: 'register-range',
        component: AuthorizedRangeFormComponent,
      },
      {
        path: 'access-query',
        component: AccessQueryComponent,//
      },
      {
        path: 'new/auth',
        component: AuthorizedFormComponent,
      },
      {
        path: 'auth-list',
        component: ListAuthComponent,//
      },
      {
        path: 'access-form',
        component: AccessFormComponent,
      },
      {
        path: '',
        redirectTo: '/visitors',
        pathMatch: 'full',
      },
];
