import { Component, Input } from '@angular/core';
// import { DashBoardFilters } from '../../models/dashboard.model';
import { PeriodRequest } from '../../models/stadistics';

@Component({
  selector: 'app-total-payments',
  standalone: true,
  imports: [],
  templateUrl: './total-payments.component.html',
  styleUrl: './total-payments.component.scss'
})
export class TotalPaymentsComponent {
  @Input() filters: PeriodRequest = {} as PeriodRequest;
}
