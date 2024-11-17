import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-employee-dashboard-info',
  standalone: true,
  imports: [],
  templateUrl: './employee-dashboard-info.component.html',
  styleUrl: './employee-dashboard-info.component.css'
})
export class EmployeeDashboardInfoComponent {
  constructor(public activeModal: NgbActiveModal) {}
}
