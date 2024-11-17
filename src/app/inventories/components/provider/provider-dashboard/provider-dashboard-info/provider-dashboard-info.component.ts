import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-provider-dashboard-info',
  standalone: true,
  imports: [],
  templateUrl: './provider-dashboard-info.component.html',
  styleUrl: './provider-dashboard-info.component.css'
})
export class ProviderDashboardInfoComponent {
  constructor(public activeModal: NgbActiveModal) {}

}
