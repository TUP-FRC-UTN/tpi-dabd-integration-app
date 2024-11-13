import { AsyncPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import {
  MainLayoutComponent,
  NavbarItem,
  ToastsContainer,
} from 'ngx-dabd-grupo01';
import { LoginComponent } from './users/components/login/login.component';
import { SessionService } from './users/services/session.service';
import { LoginService } from './users/services/login.service';
import { ForgotPasswordComponent } from './users/components/forgot-password/forgot-password.component';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterModule,
    MainLayoutComponent,
    ToastsContainer,
    AsyncPipe,
    LoginComponent,
	ForgotPasswordComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  // title = 'AppName';

  //variables
  navbarMenu: NavbarItem[] = [
    {
      label: 'Accesos',
      routerLink: 'entries',
      sidebarMenu: [
        {
          label: 'Visitantes',
          routerLink: 'entries/visitors',
        },
        {
          label: 'Consulta de Accesos',
          routerLink: 'entries/access-query',
        },
        {
          label: 'Listado de Autorización',
          routerLink: 'entries/auth-list',
        },
      ],

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
            { label: 'Lista de gastos', routerLink: 'expenses/gastos' },
            { label: 'Categorias', routerLink: 'expenses/gastos/categorias' },
            { label: 'Reporte de gastos', routerLink: 'expenses/gastos/report' },
          ],
        },
        {
          label: 'Cargos',
          subMenu: [
            { label: 'Lista de cargos', routerLink: 'expenses/cargos' },
            { label: 'Categorias', routerLink: 'expenses/cargos/categorias' }
          ],
        },
        {
          label: 'Periodo',
          subMenu: [
            { label: 'Lista de periodos', routerLink: 'expenses/periodo' },
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
          label: 'Listar Plantillas',
          routerLink: 'notifications/templates',
        },
        {
          label: 'Registrar Plantillas',
          routerLink: 'notifications/templates/new',
        }
      ],
    },
    {
      label: 'Contactos',
      routerLink: 'notifications/contacts',
      sidebarMenu: [
        {
          label: 'Listar Contactos',
          routerLink: 'notifications/contacts',
        },
        {
          label: 'Registrar Contacto',
          routerLink: 'notifications/contact/new',
        },
        {
          label: 'Auditoría de Contactos',
          routerLink: 'notifications/contact-audit',
        }
      ],
    },
    {
      label: 'Notificaciones',
      routerLink: 'notifications/send-email',
      sidebarMenu: [
        {
          label: 'Enviar Notificación',
          routerLink: 'notifications/send-email',
        },
        {
          label: 'Notificación Múltiple',
          routerLink: 'notifications/send-email-contact',
        },
        {
          label: 'Histórico',
          routerLink: 'notifications/notifications-historic',
        },
        {
          label: 'Dashboard',
          routerLink: 'notifications/notification/charts',
        },
        {
          label: 'Mis Notificaciones',
          routerLink: 'notifications/my-notification',
        }
      ],
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
      label: 'Boletas',
      routerLink: '/invoices',
      sidebarMenu: [
        {
          label: 'Lista de Expensas (Admin)',
          routerLink: '/invoices/admin-list-expensas',
        },
        {
          label: 'Lista de Expensas (Propietario)',
          routerLink: '/invoices/owner-list-expensas',
        },
        { label: 'Estadísticas', routerLink: '/invoices/stadistics' },
        {
          label: 'Revisar Transferencias de Tickets',
          routerLink: '/invoices/review-tickets-transfer',
        },
      ],
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
      routerLink: 'users',
      sidebarMenu: [
        {
          label: 'Dashboards',
          subMenu: [
            {
              label: 'Reporte Propietarios',
              routerLink: '/users/owner/reports',
            },
            { label: 'Reporte Usuarios', routerLink: '/users/user/reports' },
          ],
        }, {
          label: 'Perfil',
          subMenu: [
            {
              label: 'Consultar Perfil',
              routerLink: '/users/profile/detail',
            },
            {
              label: 'Editar Perfil',
              routerLink: '/users/profile/edit',
            },
            {
              label: 'Cambiar contraseña',
              routerLink: '/users/changepassword',
            },
          ],
        },
        {
          label: 'Propietarios',
          subMenu: [
            { label: 'Lista de Propietarios', routerLink: '/users/owner/list' },
            { label: 'Cargar Propietario', routerLink: '/users/owner/form' },
            { label: 'Asignar Lote', routerLink: '/users/owner/assign' },
            { label: 'Cargar Archivo', routerLink: '/users/files/form' },
            { label: 'Validar Archivos', routerLink: '/users/files/view' },
          ],
        },
        {
          label: 'Lotes',
          subMenu: [
            { label: 'Lista de Lotes', routerLink: '/users/plot/list' },
            { label: 'Cargar Lote', routerLink: '/users/plot/form' },
          ],
        },
        {
          label: 'Usuarios',
          subMenu: [
            { label: 'Lista de Usuarios', routerLink: '/users/user/list' },
            { label: 'Cargar Usuario', routerLink: '/users/user/form' },
            {
              label: 'Cargar Inquilino',
              routerLink: '/users/user/tenant/form',
            },
            { label: 'Lista de Roles', routerLink: '/users/roles/list' },
          /*   { label: 'Cargar Roles', routerLink: '/users/roles/form' }, */
            { label: 'Usuarios Creados', routerLink: '/users/user/created' },
            { label: 'Usuarios por Rol', routerLink: '/users/user/role' },
          ],
        },
      ],
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
  ];

  //#region LOGIN
  /**
   * Service responsible for managing user session and authentication state.
   */
  private sessionService = inject(SessionService);
  private router = inject(Router)

  /**
   * Observable that emits the current authentication status.
   * This observable updates automatically whenever the session state changes,
   * providing real-time authentication status across components.
   */
  isAuthenticated$ = this.sessionService.isAuthenticated$;

  /**
   * Maneja el evento de clic en el botón de cierre de sesión.
   *
   * Este método llama al servicio de autenticación para cerrar la sesión
   * del usuario, eliminando su sesión y actualizando el estado de autenticación.
   * Es utilizado típicamente para limpiar cualquier dato de sesión almacenado
   * y redirigir al usuario a una vista de inicio de sesión o pantalla principal.
   */
  onLogoutButtonClick() {
    this.sessionService.logout();
    this.router.navigate([""]);
  }
  //#endregion

  currentUrl$ = this.router.events.pipe(
    filter((event): event is NavigationEnd => event instanceof NavigationEnd),
    map((event: NavigationEnd) => event.urlAfterRedirects)
  );


}
