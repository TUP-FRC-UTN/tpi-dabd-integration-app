import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Notification {
  id: number;
  title: string;
  content: string;
  isRead: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  showNotifications = false;
  showModal = false;
  selectedNotification: Notification | null = null;

  ngOnInit() {
    // Ejemplo de notificaciones
    this.notifications = [
      {
        id: 1,
        title: 'Nueva plantilla creada',
        content: `


<!doctype html>
<html>

<head>
    <link href="https://fonts.googleapis.com/css?family=Goudy+Bookletter+1911|Share+Tech" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300&display=swap" rel="stylesheet">
</head>

<body style="margin: auto; font-size: 16px; font-family: 'Roboto', sans-serif; width: fit-content !important;">
    <div style="padding: 20px; border-radius: 20px; border: 10px solid #95B8CB;">
        <img style="max-width: 230px; display: block; margin-left: auto; margin-right: auto;"
            src="https://mobsta-temporal-email.s3.eu-west-2.amazonaws.com/Logo.png" />

        <div style="text-align: center; font-weight: bold; margin-top: 2%; ">
            <p style="margin-top: 1%;"> Welcome to TraffIQ! <br>
                To complete your registration, click on the button below.</p>
        </div>

        <div style="text-align: center; font-size:12px; font-weight: bold; ">
            <form>
                <a href="{{urlButton}}" style="text-decoration:none;
                     display:inline-block;
                    color:#ffffff;
                     font-weight:400;
                     background-color:#3AAEE0;
                     border-radius:4px;width:auto;
                     border-top:0px solid transparent;
                     border-right:0px solid transparent;
                     border-bottom:0px solid transparent;
                    border-left:0px solid transparent;                     padding-top:5px;padding-bottom:5px;
                     font-family:Arial, Helvetica Neue, Helvetica, sans-serif;
                     word-break:keep-all;" target="_blank">
                    <span
                        style="padding-left:20px;padding-right:20px;font-size:14px;display:inline-block;letter-spacing:normal;">
                        <span style="line-height: 28px;">
                            Confirm your registration</span>
                    </span>
                </a>
            </form>
            <p>The button does not work?</p>
            <a href="{{urlLink}}'">
                <span style="padding-left:20px;
                            padding-right:20px;
                            font-size:14px;
                            display:inline-block;">
                    <span style=" font-size:12px;">
                        This is the access link</span>
                </span>
            </a>
        </div>
        <div style="text-align: center; font-size:12px;">
            <p>--------------------------</p>
            <p>TraffiQ 2022 - All rights reserved.</p>
            <p>
                This email is informative, please do not reply to this email address, since it is not enabled to
                receive
                messages.
            </p>
        </div>
    </div>
</body>

</html>`
        ,
        isRead: false,
        timestamp: new Date()
      },
      {
        id: 2,
        title: 'Contacto actualizado',
        content: 'El contacto <em>Juan Pérez</em> ha sido actualizado.',
        isRead: true,
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        id: 1,
        title: 'Nueva plantilla creada',
        content: '<strong>Plantilla de Bienvenida</strong> ha sido creada exitosamente.',
        isRead: false,
        timestamp: new Date()
      },
      {
        id: 2,
        title: 'Contacto actualizado',
        content: 'El contacto <em>Juan Pérez</em> ha sido actualizado.',
        isRead: true,
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        id: 1,
        title: 'Nueva plantilla creada',
        content: '<strong>Plantilla de Bienvenida</strong> ha sido creada exitosamente.',
        isRead: false,
        timestamp: new Date()
      },
      {
        id: 2,
        title: 'Contacto actualizado',
        content: 'El contacto <em>Juan Pérez</em> ha sido actualizado.',
        isRead: true,
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        id: 1,
        title: 'Nueva plantilla creada',
        content: '<strong>Plantilla de Bienvenida</strong> ha sido creada exitosamente.',
        isRead: false,
        timestamp: new Date()
      },
      {
        id: 2,
        title: 'Contacto actualizado',
        content: 'El contacto <em>Juan Pérez</em> ha sido actualizado.',
        isRead: true,
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        id: 1,
        title: 'Nueva plantilla creada',
        content: '<strong>Plantilla de Bienvenida</strong> ha sido creada exitosamente.',
        isRead: false,
        timestamp: new Date()
      },
      {
        id: 2,
        title: 'Contacto actualizado',
        content: 'El contacto <em>Juan Pérez</em> ha sido actualizado.',
        isRead: true,
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        id: 1,
        title: 'Nueva plantilla creada',
        content: '<strong>Plantilla de Bienvenida</strong> ha sido creada exitosamente.',
        isRead: false,
        timestamp: new Date()
      },
      {
        id: 2,
        title: 'Contacto actualizado',
        content: 'El contacto <em>Juan Pérez</em> ha sido actualizado.',
        isRead: true,
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        id: 1,
        title: 'Nueva plantilla creada',
        content: '<strong>Plantilla de Bienvenida</strong> ha sido creada exitosamente.',
        isRead: false,
        timestamp: new Date()
      },
      {
        id: 2,
        title: 'Contacto actualizado',
        content: 'El contacto <em>Juan Pérez</em> ha sido actualizado.',
        isRead: true,
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        id: 1,
        title: 'Nueva plantilla creada',
        content: '<strong>Plantilla de Bienvenida</strong> ha sido creada exitosamente.',
        isRead: false,
        timestamp: new Date()
      },
      {
        id: 2,
        title: 'Contacto actualizado',
        content: 'El contacto <em>Juan Pérez</em> ha sido actualizado.',
        isRead: true,
        timestamp: new Date(Date.now() - 3600000)
      }, {
        id: 1,
        title: 'Nueva plantilla creada',
        content: '<strong>Plantilla de Bienvenida</strong> ha sido creada exitosamente.',
        isRead: false,
        timestamp: new Date()
      },
      {
        id: 2,
        title: 'Contacto actualizado',
        content: 'El contacto <em>Juan Pérez</em> ha sido actualizado.',
        isRead: true,
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        id: 1,
        title: 'Nueva plantilla creada',
        content: '<strong>Plantilla de Bienvenida</strong> ha sido creada exitosamente.',
        isRead: false,
        timestamp: new Date()
      },
      {
        id: 2,
        title: 'Contacto actualizado',
        content: 'El contacto <em>Juan Pérez</em> ha sido actualizado.',
        isRead: true,
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        id: 1,
        title: 'Nueva plantilla creada',
        content: '<strong>Plantilla de Bienvenida</strong> ha sido creada exitosamente.',
        isRead: false,
        timestamp: new Date()
      },
      {
        id: 2,
        title: 'Contacto actualizado',
        content: 'El contacto <em>Juan Pérez</em> ha sido actualizado.',
        isRead: true,
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        id: 1,
        title: 'Nueva plantilla creada',
        content: '<strong>Plantilla de Bienvenida</strong> ha sido creada exitosamente.',
        isRead: false,
        timestamp: new Date()
      },
      {
        id: 2,
        title: 'Contacto actualizado',
        content: 'El contacto <em>Juan Pérez</em> ha sido actualizado.',
        isRead: true,
        timestamp: new Date(Date.now() - 3600000)
      }, {
        id: 1,
        title: 'Nueva plantilla creada',
        content: '<strong>Plantilla de Bienvenida</strong> ha sido creada exitosamente.',
        isRead: false,
        timestamp: new Date()
      },
      {
        id: 2,
        title: 'Contacto actualizado',
        content: 'El contacto <em>Juan Pérez</em> ha sido actualizado.',
        isRead: true,
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        id: 1,
        title: 'Nueva plantilla creada',
        content: '<strong>Plantilla de Bienvenida</strong> ha sido creada exitosamente.',
        isRead: false,
        timestamp: new Date()
      },
      {
        id: 2,
        title: 'Contacto actualizado',
        content: 'El contacto <em>Juan Pérez</em> ha sido actualizado.',
        isRead: true,
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        id: 1,
        title: 'Nueva plantilla creada',
        content: '<strong>Plantilla de Bienvenida</strong> ha sido creada exitosamente.',
        isRead: false,
        timestamp: new Date()
      },
      {
        id: 2,
        title: 'Contacto actualizado',
        content: 'El contacto <em>Juan Pérez</em> ha sido actualizado.',
        isRead: true,
        timestamp: new Date(Date.now() - 3600000)
      }
    ];
  }

  get unreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (!this.showNotifications) {
      this.closeModal();
    }
  }

  showNotificationDetails(notification: Notification) {
    this.selectedNotification = notification;
    this.showModal = true;
    notification.isRead = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedNotification = null;
  }

  // Click fuera del dropdown para cerrarlo
  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const notificationsWrapper = document.querySelector('.notifications-wrapper');
    if (!notificationsWrapper?.contains(target)) {
      this.showNotifications = false;
    }
  }
}
