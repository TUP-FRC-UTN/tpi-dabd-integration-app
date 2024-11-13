import { Component } from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-info-expenses-list',
  standalone: true,
  imports: [],
  templateUrl: './info-expenses-list.component.html',
  styleUrl: './info-expenses-list.component.css'
})
export class InfoExpensesListComponent {
  constructor(public activeModal: NgbActiveModal) {}

}
