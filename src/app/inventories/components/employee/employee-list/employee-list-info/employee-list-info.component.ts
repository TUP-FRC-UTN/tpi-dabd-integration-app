import { Component } from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-employee-list-info',
  standalone: true,
  imports: [],
  templateUrl: './employee-list-info.component.html',
  styleUrl: './employee-list-info.component.css'
})
export class EmployeeListInfoComponent {
  constructor(public activeModal: NgbActiveModal) {}
}
