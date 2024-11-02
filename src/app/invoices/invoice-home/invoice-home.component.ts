import { Component } from '@angular/core';
import { NavbarComponent } from 'ngx-dabd-grupo01';

@Component({
  selector: 'app-invoice-home',
  standalone: true,
  imports: [NavbarComponent],
  templateUrl: './invoice-home.component.html',
  styleUrl: './invoice-home.component.scss'
})
export class InvoiceHomeComponent {

}
