import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-category-charge-info',
  standalone: true,
  imports: [],
  templateUrl: './category-charge-info.component.html',
  styleUrl: './category-charge-info.component.css'
})
export class CategoryChargeInfoComponent {
  constructor(public activeModal: NgbActiveModal) {}
}
