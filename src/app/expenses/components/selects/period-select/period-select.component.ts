import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { PeriodService } from '../../../services/period.service';
import Period from '../../../models/period';
import { Router } from '@angular/router';

@Component({
  selector: 'app-period-select',
  standalone: true,
  imports: [],
  templateUrl: './period-select.component.html',
  styleUrl: './period-select.component.css',
})
export class PeriodSelectComponent implements OnInit {
  private router: Router = inject(Router); // Inyecta el Router

  private servicePeriod: PeriodService = inject(PeriodService);

  periodList: Period[] = [];
  ngOnInit(): void {
    this.loadSelect();
  }
  @Output() periodSelected: EventEmitter<number> = new EventEmitter<number>(); // Emits the selected period ID

  @Input() redirectOnInit: boolean = false; // Para recibir un valor booleano

  private loadSelect() {
    this.servicePeriod.get().subscribe((data: Period[]) => {
      this.periodList = data;
      if(data[0].id) this.redirectToAnotherPage(data[0]?.id)
    });
  }

  onPeriodChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement; 
    const selectedValue = selectElement.value; 
    console.log('Rami' + selectedValue)
    if (selectedValue) {
      this.periodSelected.emit(Number(selectedValue)); 
    }
  }

  private redirectToAnotherPage(id:number): void {
    if(this.redirectOnInit){
      this.router.navigate([`liquidation-expense/${this.periodList[0]?.id}`]);
    }
  }

 
}
