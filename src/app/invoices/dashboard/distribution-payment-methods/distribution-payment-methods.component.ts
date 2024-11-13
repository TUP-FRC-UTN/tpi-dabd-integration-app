import { Component, Input } from '@angular/core';
import { PeriodRequest } from '../../models/stadistics';
// import { DashBoardFilters } from '../../models/dashboard.model';

@Component({
  selector: 'app-distribution-payment-methods',
  standalone: true,
  imports: [],
  templateUrl: './distribution-payment-methods.component.html',
  styleUrl: './distribution-payment-methods.component.scss'
})
export class DistributionPaymentMethodsComponent {
  @Input() filters: PeriodRequest = {} as PeriodRequest;
}
