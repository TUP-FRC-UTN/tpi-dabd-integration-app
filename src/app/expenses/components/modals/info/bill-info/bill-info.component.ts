import { Component } from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-bill-info',
  standalone: true,
  imports: [],
  templateUrl: './bill-info.component.html',
  styleUrl: './bill-info.component.css'
})
export class BillInfoComponent {
  constructor(public activeModal: NgbActiveModal) {}
}
