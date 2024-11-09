import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
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
import { filter } from 'rxjs';

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
  ForgotPasswordComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private loginService = inject(LoginService);
  private router = inject(Router);
  private activatedRouter = inject(ActivatedRoute);
  currentUrl!: string;
  
  ngOnInit(){
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(event => {
        this.currentUrl = event.url;
    });  }

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
      label: 'Gastos', //expensas
      routerLink: 'expenses',
      sidebarMenu: [
        {
          label: 'Período',
          routerLink: 'expenses/periodo',
        },
        {
          label: 'Expensas',
          routerLink: 'expenses/expenses',
        },
        {
          label: 'Cargos',
          routerLink: 'expenses/cargos',
        },
        {
          label: 'Gastos',
          routerLink: 'expenses/gastos',
        },
      ],
    },
    {
      label: 'Notificaciones',
      routerLink: 'notifications',
      sidebarMenu: [
        {
          label: 'Templates',
          routerLink: 'notifications/templates',
        },
        {
          label: 'Mandar Email',
          routerLink: 'notifications/send-email',
        },
        {
          label: 'Mandar Email a Varios',
          routerLink: 'notifications/send-email-contact',
        },
        {
          label: 'Historial de Notificaciones',
          routerLink: 'notifications/notifications-historic',
        },
        {
          label: 'Auditoría de Contactos',
          routerLink: 'notifications/contact-audit',
        },
        {
          label: 'Listar Contactos',
          routerLink: 'notifications/contacts',
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
      ],
    },
    {
      label: 'Obras y Multas',
      routerLink: 'penalties',
      sidebarMenu: [
        {
          label: 'Obras',
          routerLink: 'penalties/constructions',
        },
        {
          label: 'Multas',
          subMenu: [
            { label: 'Multas', routerLink: 'penalties/fine' },
            { label: 'Infracciones', routerLink: 'penalties/infraction' },
            { label: 'Reclamos', routerLink: 'penalties/claim' },
            {
              label: 'Tipos de Sanciones',
              routerLink: 'penalties/sanctionType',
            },
          ],
        },
      ],
    },
    {
      label: 'Proveedores',
      routerLink: 'inventories',
      sidebarMenu: [
        {
          label: 'Empleados',
          routerLink: 'inventories/employees/list',
        },
        {
          label: 'Proveedores',
          routerLink: 'inventories/providers/list',
        },
        {
          label: 'Inventarios',
          subMenu: [
            { label: 'Inventarios', routerLink: 'inventories/inventories' },
            {
              label: 'Nuevo Artículo',
              routerLink: 'inventories/articles/article',
            },
          ],
        },
      ],
    },
    {
      label: 'Tickets', //invoices
      routerLink: 'invoices',
      sidebarMenu: [
        {
          label: 'Lista de Expensas (Propietario)',
          routerLink: 'invoices/admin-list-expensas',
        },
        {
          label: 'Lista de Expensas (Propietario)',
          routerLink: 'invoices/owner-list-expensas',
        },
        {
          label: 'Estadísticas',
          routerLink: 'invoices/stadistics',
        },
        {
          label: 'Review-Tickets-Transfer',
          routerLink: 'invoices/review-tickets-transfer',
        },
      ],
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
              label: 'Cargar Usuario Inquilino',
              routerLink: '/users/user/tenant/form',
            },
            { label: 'Lista de Roles', routerLink: '/users/roles/list' },
            { label: 'Cargar Roles', routerLink: '/users/roles/form' },
            { label: 'Usuarios Creados', routerLink: '/users/user/created/1' },
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
    this.loginService.logout();
    this.router.navigate([""]);
  }
  //#endregion
}
