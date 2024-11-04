import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { SideNavbarComponent } from 'ngx-dabd-2w1-core';
import { MainLayoutComponent, NavbarComponent, NavbarItem, SidebarItem } from 'ngx-dabd-grupo01';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, NavbarComponent, MainLayoutComponent, SideNavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'AppName';
  
  sidebarMenu: SidebarItem[] = [
    {
      label: 'Facturas',
      subMenu: [
        { label: 'Lista de Expensas (Admin)', routerLink: '/invoices/admin-list-expensas' },
        { label: 'Lista de Expensas (Propietario)', routerLink: '/invoices/owner-list-expensas' },
        { label: 'Estadísticas', routerLink: '/invoices/stadistics' },
        { label: 'Revisar Transferencias de Tickets', routerLink: '/invoices/review-tickets-transfer' },
      ]
    }
  ];
  navbarMenu: NavbarItem[] = [
    {
      label: 'Accesos',
      routerLink: '/entries'
    },
    {
      label: 'Boletas - Cobros',
      routerLink: '/invoices',
      sidebarMenu: this.sidebarMenu,
    },
    {
      label: 'Gastos',
      routerLink: '/expenses'
    },
    {
      label: 'Inventario - Empleados - Proveedores',
      routerLink: '/inventories'
    },
    {
      label: 'Multas',
      routerLink: '/penalties'
    },
    {
      label: 'Notificaciones',
      routerLink: '/notifications'
    },
    {
      label: 'Usuarios',
      routerLink: '/users'
    }
  ];



}
