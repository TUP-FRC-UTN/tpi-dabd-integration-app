import { Component, inject, input, Input, OnInit, SimpleChanges } from '@angular/core';
import { ExpenseServiceService} from "../../../../services/expense.service";
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PeriodSelectComponent} from "../../../selects/period-select/period-select.component";
import {CommonModule, DatePipe} from '@angular/common';

import {NgPipesModule} from "ngx-pipes";
import {
  TableColumn, TableComponent, ConfirmAlertComponent,

  MainContainerComponent,
  ToastService, TableFiltersComponent, Filter, FilterConfigBuilder, FilterOption, SelectFilter
} from "ngx-dabd-grupo01" ;
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import Expense from "../../../../models/expense";

@Component({
  selector: 'app-expenses-report',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule, PeriodSelectComponent, TableComponent, NgPipesModule, MainContainerComponent, TableFiltersComponent
  ],
  providers: [DatePipe, NgbActiveModal],
  templateUrl: './expenses-report.component.html',
  styleUrl: './expenses-report.component.css'
})
export class ExpensesReportComponent {
  periods: FilterOption[] = [];
  lotss: FilterOption[] = []
  types: FilterOption[]= []
  filterConfig: Filter[] = [
    new SelectFilter('Lote','lot','Seleccione un lote',this.lotss),
    new SelectFilter('Tipo de lote','type','Seleccione un tipo de lote',this.types),
    new SelectFilter('Periodos','period','Seleccione un periodo',this.periods)
  ]
  expenses: Expense[] = [];
  searchTerm: string = "";

  onFilterTextBoxChanged($event: Event) {

  }
  filterChange($event: Record<string, any>) {

  }





}
