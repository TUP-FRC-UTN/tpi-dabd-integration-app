import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NotificationsComponent } from '../../notifications/notifications.component';
import { ToastService, ConfirmAlertComponent } from 'ngx-dabd-grupo01';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoginService } from '../../../services/login.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [ RouterLink, NotificationsComponent ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  private router = inject(Router);
  private toastService = inject(ToastService);
  private modalService = inject(NgbModal);
  private loginService = inject(LoginService);

  constructor(){}

  logout() {
    const modalRef = this.modalService.open(ConfirmAlertComponent);
    modalRef.componentInstance.alertTitle = 'Logout';
    modalRef.componentInstance.alertMessage = `Esta seguro que desea cerrar su sesion?`;

    modalRef.result.then((result) => {
      if (result) {
        this.loginService.logout();
        this.toastService.sendError('Cierre de sesion');
        this.router.navigate(['/login']);
      }
    });
  }
}
