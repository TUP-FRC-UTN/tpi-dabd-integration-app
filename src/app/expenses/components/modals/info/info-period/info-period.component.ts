import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-info-period',
  standalone: true,
  imports: [],
  templateUrl: './info-period.component.html',
  styleUrl: './info-period.component.css'
})
export class InfoPeriodComponent {
  constructor(public activeModal: NgbActiveModal) {}

}
