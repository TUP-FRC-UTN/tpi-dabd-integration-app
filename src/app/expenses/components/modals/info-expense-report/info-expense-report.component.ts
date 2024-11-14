import { Component } from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-info-expense-report',
  standalone: true,
  imports: [],
  templateUrl: './info-expense-report.component.html',
  styleUrl: './info-expense-report.component.css'
})
export class InfoExpenseReportComponent {
  constructor(public activeModal: NgbActiveModal) {
  }

}
