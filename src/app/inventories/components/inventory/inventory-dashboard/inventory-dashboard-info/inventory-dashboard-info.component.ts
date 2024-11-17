import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-inventory-dashboard-info',
  standalone: true,
  imports: [],
  templateUrl: './inventory-dashboard-info.component.html',
  styleUrl: './inventory-dashboard-info.component.css'
})
export class InventoryDashboardInfoComponent {
  constructor(public activeModal: NgbActiveModal) {}

}
