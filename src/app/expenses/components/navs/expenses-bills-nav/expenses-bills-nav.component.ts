import { Component } from '@angular/core';
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-expenses-bills-nav',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './expenses-bills-nav.component.html',
  styleUrl: './expenses-bills-nav.component.css'
})
export class ExpensesBillsNavComponent {

}
