import { Routes } from '@angular/router';
import { LiquidationExpenseDetailsComponent } from './components/expenses-period/expenses-liquidation-details/expenses-liquidation-details.component';
import { ExpensesLiquidationComponent } from './components/expenses-period/expenses-liquidation/expenses-liquidation.component';
import { ExpensesListComponent } from './components/expenses-period/expenses-list/expenses-list.component';
import {
  ExpensesListChargesComponent
} from "./components/expenses-charges/expenses-list-charges/expenses-list-charges.component";
import {
  ExpensesAddChargeComponent
} from "./components/expenses-charges/expenses-add-charge/expenses-add-charge.component";
import {ExpensesAddBillComponent} from "./components/expenses-bills/expenses-add-bill/expenses-add-bill.component";
import {
  ExpensesCategoryBillComponent
} from "./components/expenses-bills/expenses-category-bill/expenses-category-bill.component";
import {
  ExpensesPeriodListComponent
} from "./components/expenses-period/expenses-period-list/expenses-period-list.component";

import {
  ExpensesReportComponent
} from "./components/expenses-period/expenses-report/expenses-report/expenses-report.component";

import { ExpensesListBillsComponent } from './components/expenses-bills/expenses-list-bills/expenses-list-bills.component';

export const EXPENSES_ROUTES: Routes = [
  // Ruta periodos - manejo del estado del periodo
  { path: 'periodo', component: ExpensesPeriodListComponent },
  { path: 'periodo/:period_id/expensas', component: ExpensesListComponent },
  { path: 'periodo/:period_id/liquidacion', component: ExpensesLiquidationComponent },
  { path: 'periodo/:period_id/gastos', component: LiquidationExpenseDetailsComponent },

  // Ruta expenses - CRUD de expensas
  { path: 'expenses', component: ExpensesListComponent },
  { path: 'expenses/report', component: ExpensesReportComponent},
  { path: 'expenses/nuevo', component: ExpensesListChargesComponent },
  { path: 'expenses/modificar/:id', component: ExpensesListChargesComponent },

  // Rutas cargos - CRUD de cargos
  { path: 'cargos', component: ExpensesListChargesComponent },
  { path: 'cargos/nuevo', component: ExpensesAddChargeComponent },
  { path: 'cargos/modificar/:id', component: LiquidationExpenseDetailsComponent },

  // Ruta bills - CRUD de gastos
  { path: 'gastos', component: ExpensesListBillsComponent },
  { path: 'gastos/nuevo', component: ExpensesAddBillComponent },
  { path: 'gastos/modificar/:id', component: ExpensesAddBillComponent },
  { path: 'gastos/categorias', component: ExpensesCategoryBillComponent },
];

