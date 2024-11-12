import {Component, inject} from '@angular/core';
import {RouterModule, RouterOutlet} from '@angular/router';
import {MainLayoutComponent, NavbarItem, ToastsContainer} from 'ngx-dabd-grupo01';
import {RoleSelectorComponent} from './penalties/shared/components/role-selector/role-selector.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, MainLayoutComponent, ToastsContainer, RoleSelectorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  // title = 'AppName';

  //variables
  navbarMenu: NavbarItem[] = [
    {
      label: 'Accesos',
      routerLink:'entries',
      sidebarMenu: [
        {
          label: 'Entidades',
          routerLink: 'entries/entity/list'
        },
        {
          label: 'Consulta de Accesos',
          routerLink: 'entries/access-query'
        },
        {
          label: 'Listado de Autorización',
          routerLink: 'entries/auth-list'
        }
      ]
    },
    {
      label: 'Empleados',
      routerLink:'inventories',
      sidebarMenu: [
        {
          label: 'Empleados',
          routerLink: 'inventories/employees/list'
        }
      ]
    },
    {
      label: 'Gastos', //expensas
      routerLink:'expenses',
      sidebarMenu: [
        {
          label: 'Gastos',
          subMenu: [
            { label: 'Lista', routerLink: 'expenses/gastos' },
            { label: 'Categorias', routerLink: 'expenses/gastos/categorias' }
          ],
        },
        {
          label: 'Cargos',
          routerLink: 'expenses/cargos'
        },
        {
          label: 'Periodo',
          subMenu: [
            { label: 'Lista', routerLink: 'expenses/periodo' },
            { label: 'Historico de expensas', routerLink: 'expenses/expenses' },
            { label: 'Reporte de expensas', routerLink: 'expenses/expenses/report' },
          ]
        },
      ],
    },
    {
      label: 'Inventarios',
      routerLink:'inventories',
      sidebarMenu: [
        {
          label: 'Inventarios',
          subMenu: [
            {label: 'Inventarios',routerLink:'inventories/inventories'},
            {label: 'Nuevo Artículo',routerLink:'inventories/articles/article'},
          ]
        }
      ]
    },
    {
      label: 'Multas',
      routerLink: 'penalties/sanctionType',
      sidebarMenu: [

        {
          label: 'Multas',
          subMenu: [
            {label: 'Multas',routerLink:'penalties/fine'},
            {label: 'Infracciones',routerLink:'penalties/infraction'},
            {label: 'Reclamos',routerLink:'penalties/claim'},
            {label: 'Tipos de Sanciones',routerLink:'penalties/sanctionType'}
          ]
        }
      ]
    },
    {
      label: 'Notificaciones',
      routerLink:'notifications',
      sidebarMenu: [
        {
          label: 'Templates',
          routerLink: 'notifications/templates'
        },
        {
          label: 'Mandar Email',
          routerLink: 'notifications/send-email'
        },
        {
          label: 'Mandar Email a Varios',
          routerLink: 'notifications/send-email-contact'
        },
        {
          label: 'Historial de Notificaciones',
          routerLink: 'notifications/notifications-historic'
        },
        {
          label: 'Auditoría de Contactos',
          routerLink: 'notifications/contact-audit'
        },
        {
          label: 'Listar Contactos',
          routerLink: 'notifications/contacts'
        },
        // se que notificaciones tenia un sub menu, pero como no recuerdo como era les dejo este "template" para que lo modifiquen como les parece
        // {
        //   label: 'Moderations',
        //   subMenu: [
        //     {label: 'Multas',routerLink:'penalties/fine'},
        //     {label: 'Infracciones',routerLink:'penalties/infraction'},
        //     {label: 'Reclamos',routerLink:'penalties/claim'},
        //     {label: 'Tipos de Sanciones',routerLink:'penalties/sanctionType'}
        //   ]
        // }
      ]
    },
    {
      label: 'Obras',
      routerLink: 'penalties',
      sidebarMenu: [
        {
          label: 'Obras',
          routerLink: 'penalties/constructions'
        }
      ]
    },
    {
      label: 'Proveedores',
      routerLink:'inventories',
      sidebarMenu: [
        {
          label: 'Proveedores',
          routerLink: 'inventories/providers/list'
        },
      ]
    },
    {
      label: 'Tickets', //invoices
      routerLink:'invoices',
      sidebarMenu: [
        {
          label: 'Lista de Expensas (Propietario)',
          routerLink: 'invoices/admin-list-expensas'
        },
        {
          label: 'Lista de Expensas (Propietario)',
          routerLink: 'invoices/owner-list-expensas'
        },
        {
          label: 'Estadísticas',
          routerLink: 'invoices/stadistics'
        },
        {
          label: 'Review-Tickets-Transfer',
          routerLink: 'invoices/review-tickets-transfer'
        }
      ]
    },
    {
      label: 'Usuarios',
      routerLink:'users',
      sidebarMenu: [
        {
          label: 'Home',
          routerLink: 'users/home'
        },
        {
          label: 'Dueños',
          routerLink: 'users/owner/list'
        },
        {
          label: 'Plots',
          routerLink: 'users/plot/list'
        },
        {
          label: 'Propietario En Validación',
          routerLink: 'users/files/view'
        },
        {
          label: 'Usuarios',
          routerLink: 'users/user/list'
        },
        {
          label: 'Roles',
          routerLink: 'users/roles/list'
        },
      ]
    },
    // not working for now
    // {
    //   label: 'Configuración',
    //   subMenu: [
    //     { label: 'Usuarios', routerLink: '/user' },
    //     { label: 'Roles', routerLink: '/role' },
    //     { label: 'Lotes', routerLink: '/lot' },
    //   ],
    // },
  ]

  //services

  //methods
}
