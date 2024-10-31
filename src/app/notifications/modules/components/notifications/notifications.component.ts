import { Component, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../app/services/notification.service';
import { NotificationApi, NotificationFront } from '../../../app/models/notification';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  notifications: NotificationFront[] = [];
  selectedNotification: NotificationFront | null = null;
  showNotifications = false;
  showModal = false;

  showModalToRenderHTML: boolean = false;

  notificationService = new NotificationService();
  @ViewChild('iframePreview', { static: false }) iframePreview!: ElementRef;

  ngOnInit() {
    this.notificationService.getAllNotification().subscribe({
      next: (notifications) => {
        this.notifications = notifications.sort((a, b) => {
          return Number(a.isRead) - Number(b.isRead);
        });
      },
      error: (error) => {
        console.error('Error al cargar las notificaciones', error);
      }
    });
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


  showNotificationDetails(notification: NotificationFront) {
    // Marca la notificación como leída
    notification.isRead = true;
    this.notificationService.isRead(notification.id).subscribe({
      next: () => {
        notification.isRead = true;
        // Llama a previewContent para mostrar el contenido en el iframe
        this.previewContent(notification);
      },
      error: (error) => {
        console.error('Error al actualizar la notificación como leída', error);
      }
    });
  }

  closeModal() {
    this.showModal = false;
    this.selectedNotification = null;
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const notificationsWrapper = document.querySelector('.notifications-wrapper');
    if (!notificationsWrapper?.contains(target)) {
      this.showNotifications = false;
    }
  }

  closeModalToRenderHTML(): void {
    this.showModalToRenderHTML = false;
  }

  previewContent(notification: NotificationFront): void {
    this.showModalToRenderHTML = true;
    setTimeout(() => {
      const iframe = this.iframePreview.nativeElement as HTMLIFrameElement;
      iframe.srcdoc = notification.body; // Usa el body de la notificación como contenido del iframe
      iframe.onload = () => {
        const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDocument) {
          const height = iframeDocument.documentElement.scrollHeight;
          iframe.style.height = `${height}px`; // Ajusta la altura del iframe
        }
      };
    }, 5);
  }
}
