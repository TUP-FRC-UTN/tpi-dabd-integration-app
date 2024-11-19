import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-bills-report-info',
  standalone: true,
  imports: [],
  templateUrl: './bills-report-info.component.html',
  styleUrl: './bills-report-info.component.scss'
})
export class BillsReportInfoComponent {
  constructor(public activeModal: NgbActiveModal) {}
}
