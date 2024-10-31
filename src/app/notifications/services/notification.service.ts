import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { NotificationApi } from '../models/notification';
import { forkJoin, map, switchMap } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private apiUrl: string;

  constructor() {
    
    this.apiUrl = environment.apis.notifications.url;
  }

  private http: HttpClient = inject(HttpClient)

  getNotificationByContact(){
    const params = new HttpParams().set('contactId', 1); 
    const url = `${this.apiUrl}/notifications`;
  
    return this.http.get<NotificationApi[]>(url, { params }).pipe(
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

  getAllNotification() {
    const url = `${this.apiUrl}/notifications`;
    return this.http.get<NotificationApi[]>(url).pipe(
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

  getNotificationById(id: number) {
    const url = `${this.apiUrl}/notifications/${id}`;
    return this.http.get<NotificationApi>(url);
  }


  isRead(id: number) {
    const url = `${this.apiUrl}/notifications/${id}`
    const body = { statusSend: 'VISUALIZED' };
    return this.http.put(url, body)
  }

  private convertDateString(dateString: string): Date {
    const parts = dateString.split('/');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  
}
