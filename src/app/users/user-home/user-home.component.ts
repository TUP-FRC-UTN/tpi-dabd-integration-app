import { Component, inject } from '@angular/core';
import { SessionService } from '../services/session.service';
import { MainLayoutComponent, NavbarItem, ToastsContainer } from 'ngx-dabd-grupo01';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AsyncPipe, CommonModule } from '@angular/common';
import { LoginComponent } from '../components/login/login.component';

@Component({
  selector: 'app-user-home',
  standalone: true,
  imports: [RouterOutlet, ToastsContainer, AsyncPipe,
    CommonModule, RouterLink, LoginComponent, MainLayoutComponent],
  templateUrl: './user-home.component.html',
  styleUrl: './user-home.component.scss'
})
export class UserHomeComponent {
  navbarMenu: NavbarItem[] = [
    {
      label: 'Usuarios',
      sidebarMenu: [
        {
          label: 'Propietarios',
          subMenu: [
            { label: 'Lista de Propietarios', routerLink: '/users/owner/list' },
            { label: 'Cargar Propietario', routerLink: '/users/owner/form' },
            { label: 'Cargar Archivo', routerLink: '/users/files/form' },
            { label: 'Validar Archivos', routerLink: '/users/files/view' },
          ]
        },
        {
          label: 'Lotes',
          subMenu: [
            { label: 'Lista de Lotes', routerLink: '/users/plot/list' },
            { label: 'Cargar Lote', routerLink: '/users/plot/form' },
          ]
        },
        {
          label: 'Usuarios',
          subMenu: [
            { label: 'Lista de Usuarios', routerLink: '/users/user/list' },
            { label: 'Cargar Usuario', routerLink: '/users/user/form' },
            { label: 'Cargar Usuario Inquilino', routerLink: '/users/user/tenant/form' },
            { label: 'Lista de Roles', routerLink: '/users/roles/list' },
            { label: 'Cargar Roles', routerLink: '/users/roles/form' },
            { label: 'Usuarios Creados', routerLink: '/users/user/created/1' },
          ]
        },
        {
          label: 'Cuentas',
          subMenu: [
            { label: 'Lista de Cuentas', routerLink: '/users/account/list' },
          ]
        }
      ]
    }
  ];


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
}
