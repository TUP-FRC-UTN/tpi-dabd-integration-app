import { Component, inject, OnInit } from '@angular/core';
import { ExpensesPeriodNavComponent } from '../../navs/expenses-period-nav/expenses-period-nav.component';
import { ExpenseServiceService } from '../../../services/expense.service';
import Expense from '../../../models/expense';
import { ActivatedRoute } from '@angular/router';
import { NgbModule, NgbToast } from '@ng-bootstrap/ng-bootstrap';
import { generateNumberArray } from '../../../utils/generateArrayNumber';
import { FormsModule } from '@angular/forms';
import { ToastService } from 'ngx-dabd-grupo01';
import {switchMap} from "rxjs";

@Component({
  selector: 'app-expenses-period-expenses',
  standalone: true,
  imports: [ExpensesPeriodNavComponent, ExpensesPeriodNavComponent, NgbModule, FormsModule ],
  templateUrl: './expenses-period-expenses.component.html',
  styleUrl: './expenses-period-expenses.component.css',
})
export class ExpensesPeriodExpensesComponent implements OnInit {

finde() {
  this.loadList()
}
  toastService:ToastService = inject(ToastService)
  cantPages: number = 1;
  indexActive = 1;
  size = 10;
  currentPage: number = 1;
  visiblePages: number[] = [];
  type:number|undefined=undefined
  lote: number | null = null;
  filter:string|null=null

  changeFilter(filter: string|null) {
    if(!filter){
      this.lote=null
      this.loadList()
    }
    this.filter=filter
    }

  onSelectChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.size = Number(selectElement.value);
    this.loadList();
  }

  selectType(arg0: string|undefined) {
    if(arg0==="Ordinarias"){
      this.type=1
    }
     if(arg0==="Extraordinarias"){
      this.type=2
    }
    if(!arg0){
      this.type=undefined
      console.log(this.type)
    }
    this.loadList()
  }

  ngOnInit(): void {
    this.loadId();
    this.loadList();
  }

  private expenseService: ExpenseServiceService = inject(ExpenseServiceService);
  private route = inject(ActivatedRoute);
  periodId: string | null = null;
  listExpenses: Expense[] = [];

  loadList() {
    console.log(this.periodId)
    this.expenseService.getByPeriod(Number(this.periodId))
      .pipe(
        switchMap(() => {
          return this.expenseService.getExpenses(
            this.currentPage - 1,
            this.size,
            Number(this.periodId),
            this.lote||undefined,
            this.type
          );
        })
      )
      .subscribe((data) => {
        this.listExpenses = data.content;
        this.cantPages = data.totalElements;
      });
  }

  loadId() {
    this.periodId = this.route.snapshot.paramMap.get('period_id');
  }
  changeIndex($event: number) {
    this.currentPage = $event;
    this.loadList();
  }
}
