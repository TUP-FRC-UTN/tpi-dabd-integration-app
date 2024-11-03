import { Component } from '@angular/core';
import { MainLayoutComponent, NavbarComponent, NavbarItem } from 'ngx-dabd-grupo01';

@Component({
  selector: 'app-invoice-home',
  standalone: true,
  imports: [NavbarComponent, MainLayoutComponent],
  templateUrl: './invoice-home.component.html',
  styleUrl: './invoice-home.component.scss'
})
export class InvoiceHomeComponent {
  navbarMenu: NavbarItem[] = [
    {
      label: 'Facturas',
      sidebarMenu: [
        {
          label: 'Inicio',
          subMenu: [
            { label: 'Inicio', routerLink: '/invoices' },
          ]
        },
        {
          label: 'Administración',
          subMenu: [
            { label: 'Lista de Expensas (Admin)', routerLink: '/invoices/admin-list-expensas' },
            { label: 'Lista de Expensas (Propietario)', routerLink: '/invoices/owner-list-expensas' },
            { label: 'Estadísticas', routerLink: '/invoices/stadistics' },
            { label: 'Revisar Transferencias de Tickets', routerLink: '/invoices/review-tickets-transfer' },
          ]
        }
      ]
    }
  ];
}
