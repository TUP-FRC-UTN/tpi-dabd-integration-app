import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { Observable, forkJoin, map, switchMap } from 'rxjs';
import { Notification, NotificationApi } from '../models/notification';


@Injectable({
  providedIn: 'root'
})
export class NotificationsService {


private http = inject(HttpClient);
private apiUrl: string;

constructor() {

  this.apiUrl = environment.apis.notifications.url;

}

// getAllNotifications(): Observable<Notification[]> {
//   return this.http.get<any[]>(`${this.apiUrl}/notifications`).pipe(
//     map(notifications => notifications.map(notification => this.transformNotification(notification)))
//   );
// }

getAllNotifications(): Observable<Notification[]> {
  return this.http.get<any[]>(`${this.apiUrl}/notifications`).pipe(
    switchMap(notifications => {
      const detailedRequests = notifications.map(notification =>
        this.http.get<NotificationApi>(`${this.apiUrl}/notifications/${notification.id}`).pipe(
          map(detailedNotification => ({
            ...notification,
            body: detailedNotification.body || '', 
            isRead: notification.statusSend === 'VISUALIZED',
            dateSend: this.convertDateString(notification.dateSend),
            dateNotification: new Date().toLocaleDateString() 
          }))
        )
      );

      return forkJoin(detailedRequests);
    }),
    map((notificationsWithTemplates) =>
      notificationsWithTemplates.sort((a, b) => b.id - a.id)
    )
  );
}
private transformNotification(data: any): Notification {
  const notification: Notification = {
    id: data.id,
    recipient: data.recipient,
    subject: data.subject,
    templateId: data.templateId,
    templateName: data.templateName,
    statusSend: data.statusSend,
    dateSend: data.dateSend,
    body: data.body
  };
  return notification;
}

private convertDateString(dateString: string): Date {
  const parts = dateString.split('/');
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  return new Date(year, month, day);
}

}