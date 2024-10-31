import { Component } from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-category-bill-info',
  standalone: true,
  imports: [],
  templateUrl: './category-bill-info.component.html',
  styleUrl: './category-bill-info.component.css'
})
export class CategoryBillInfoComponent {
  constructor(public activeModal: NgbActiveModal) {}
}
