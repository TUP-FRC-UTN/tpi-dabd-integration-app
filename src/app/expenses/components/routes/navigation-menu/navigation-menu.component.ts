import {Component, inject, OnInit} from '@angular/core';
import {MenuItems, NavbarComponent} from "ngx-dabd-2w1-core";
import { ActivatedRoute, Router } from '@angular/router';
import { ExpenseComponent } from '../../expensas/getAll/expense/expense.component';
import { PeriodSelectComponent } from "../../selects/period-select/period-select.component";
import { LiquidationExpenseDetailsComponent } from '../../liquidacion/liquidation-expense-details/liquidation-expense-details.component';
import { ExpensesLiquidationExpenseComponent } from '../../liquidacion/expenses-liquidation-expense/expenses-liquidation-expense.component';

@Component({
  selector: 'app-navigation-menu',
  standalone: true,
  imports: [
    NavbarComponent,
    ExpensesLiquidationExpenseComponent,
    LiquidationExpenseDetailsComponent,
    /*LiquidationExpenseComponent,*/
    ExpenseComponent,
    PeriodSelectComponent
],
  templateUrl: './navigation-menu.component.html',
  styleUrl: './navigation-menu.component.css'
})
export class NavigationMenuComponent implements OnInit {

  private readonly router = inject(Router);

  visibleSection: string = '';

  items: MenuItems[] = [
    {
      key: 'bills',
      name: 'Gastos',
      icon: 'alarm',
      active: false,
      disabled: false
    },
    {
      key: 'charges',
      name: 'Cargos',
      active: false,
      disabled: false
    },
    {
      key: 'expense',
      name: 'Expensas',
      active: false,
      disabled: false
    },
    {
      key: 'liquidation-expense',
      name: 'Liquidacion de Expensas',
      active: false,
      disabled: false
    },
    {
      key: 'accounts',
      name: 'Cuentas',
      active: false,
      disabled: false
    }
  ];

  onMenuVisited(key: string) {
    this.router.navigate(['liquidation-expense/1'])
    // this.visibleSection = key;
    // this.items.forEach(value => value.key == key ? value.active = true : value.active = false)

  }

  ngOnInit(): void {
    this.onMenuVisited('bills')
  }
}
