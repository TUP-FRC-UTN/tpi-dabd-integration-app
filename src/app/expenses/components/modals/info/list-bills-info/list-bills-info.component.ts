import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-expenses-list-bills-info',
  standalone: true,
  imports: [],
  templateUrl: './list-bills-info.component.html',
  styleUrl: './list-bills-info.component.css'
})
export class ListBillsInfoComponent {
  constructor(public activeModal: NgbActiveModal) {}
}
