import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-list-charges-info',
  standalone: true,
  imports: [],
  templateUrl: './list-charges-info.component.html',
  styleUrl: './list-charges-info.component.css'
})
export class ListChargesInfoComponent {
  constructor(public activeModal: NgbActiveModal) {}
}
