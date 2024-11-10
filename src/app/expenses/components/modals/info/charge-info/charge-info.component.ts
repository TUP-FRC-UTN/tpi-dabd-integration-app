import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-charge-info',
  standalone: true,
  imports: [],
  templateUrl: './charge-info.component.html',
  styleUrl: './charge-info.component.css'
})
export class ChargeInfoComponent {
  constructor(public activeModal: NgbActiveModal) {}
}
